import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SupervisorService {
  async markTaskComplete(supervisorId: string, taskId: string) {
    // Find the assignment and check supervisor owns the employee
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: taskId },
      include: { employee: true },
    });
    if (!assignment) throw new BadRequestException('Task not found');
    if (assignment.employee.supervisorId !== supervisorId) {
      throw new BadRequestException('You can only complete tasks for your own cleaners');
    }
    // Update status to COMPLETED
    return this.prisma.assignment.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }
  async getWorkplaces(): Promise<import('@prisma/client').Workplace[]> {
    return this.prisma.workplace.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  constructor(
    private prisma: PrismaService,
    private mailer: MailerService, // Inject MailerService
  ) {}

  async getCleaners(supervisorId: string) {
    return this.prisma.user.findMany({
      where: {
        supervisorId,
        role: 'EMPLOYEE',
      },
      select: {
        id: true,
        name: true,
        status: true,
        location: { select: { name: true } },
      },
    });
  }

  async getRecentTasks(supervisorId: string) {
    return this.prisma.assignment.findMany({
      where: {
        employee: { supervisorId },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        employee: { select: { name: true } },
        createdAt: true,
        status: true,
      },
    });
  }

  async assignTask(supervisorId: string, data: any) {
    // Validate that the supervisor is assigning the task to their own cleaner
    const cleaner = await this.prisma.user.findUnique({
      where: { id: data.cleanerId },
      select: { supervisorId: true, email: true, name: true },
    });

    if (cleaner?.supervisorId !== supervisorId) {
      throw new Error('You can only assign tasks to your own cleaners.');
    }

    const dueDate = data.dueDate ? new Date(data.dueDate) : null;
    let status: 'UPCOMING' | 'PENDING' | 'IN_PROGRESS' = 'UPCOMING';

    if (dueDate) {
      const now = new Date();
      // Compare only the date part
      const dueDateOnly = new Date(dueDate.toISOString().split('T')[0]);
      const nowOnly = new Date(now.toISOString().split('T')[0]);
      if (dueDateOnly <= nowOnly) {
        status = 'PENDING';
      }
    }

    // Validate startTime
    let startTime: Date | null = null;
    if (data.startTime) {
      const parsedStartTime = new Date(data.startTime);
      if (!isNaN(parsedStartTime.getTime())) {
        startTime = parsedStartTime;
      }
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        employeeId: data.cleanerId,
        title: data.title,
        description: data.description,
        location: data.location || '',
        workplaceId: data.workplaceId,
        priority: data.priority,
        estimatedHours: data.estimatedHours ? parseFloat(data.estimatedHours) : null,
        dueDate,
        startTime,
        status,
        // ...any other fields...
      }
    });

    // Send email notification
    await this.mailer.sendMail(
      cleaner.email,
      'New Task Assigned',
      `
        <h2>Hello ${cleaner.name},</h2>
        <p>You have been assigned a new task: <strong>${data.title}</strong>.</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Priority:</strong> ${data.priority}</p>
        <p>Please check your dashboard for details.</p>
      `
    );

    return assignment;
  }

  async getDashboardData(supervisorId: string) {
    // 1. Team members supervised by this supervisor
    const teamMembers = await this.prisma.user.findMany({
      where: { supervisorId },
      select: {
        name: true,
        status: true,
        location: { select: { name: true } },
        clockLogs: {
          where: {
            clockIn: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)), // today
            },
          },
          select: { regularHours: true, overtimeHours: true },
        },
        // You can add more fields as needed
      },
    });

    // 2. Stats
    const activeTasks = await this.prisma.assignment.count({
      where: {
        employee: { supervisorId },
        status: 'IN_PROGRESS', // uncomment and fix if needed
      },
    });
    const completedToday = await this.prisma.assignment.count({
      where: {
        employee: { supervisorId },
        status: 'COMPLETED', // <-- fix here
        updatedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    const alerts = await this.prisma.assignment.count({
      where: {
        employee: { supervisorId },
        status: 'REVIEW', // <-- fix here or add 'ALERT' to enum if needed
      },
    });

    // 3. Pending reviews (tasks completed but not yet reviewed)
    const pendingReviews = await this.prisma.assignment.findMany({
      where: {
        employee: { supervisorId },
        status: 'REVIEW', // <-- fix here
        reviewed: false,
      },
      select: {
        title: true,
        employee: { select: { name: true } },
        updatedAt: true,
        priority: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    return {
      stats: {
        teamSize: teamMembers.length,
        activeTasks,
        completedToday,
        alerts,
      },
      teamMembers: teamMembers.map(member => ({
        name: member.name,
        status: member.status || 'Offline',
        location: member.location?.name || 'Unknown',
        hours: (
          (member.clockLogs?.reduce((sum, log) => sum + (log.regularHours ?? 0) + (log.overtimeHours ?? 0), 0)) || 0
        ).toFixed(1),
        performance: 'Good', // You can calculate this based on your own logic
      })),
      pendingReviews: pendingReviews.map(task => ({
        task: task.title,
        cleaner: task.employee.name,
        completed: `${Math.round((Date.now() - new Date(task.updatedAt).getTime()) / 3600000)} hours ago`,
        priority: task.priority || 'Medium',
      })),
    };
  }

  async getTeamMembers(supervisorId: string) {
    // Calculate start of week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const users = await this.prisma.user.findMany({
      where: { supervisorId, role: 'EMPLOYEE' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        clockLogs: {
          where: {
            clockIn: {
              gte: startOfWeek,
            },
          },
          select: { 
            clockIn: true, 
            clockOut: true, // <-- Add this line
            regularHours: true, 
            overtimeHours: true 
          },
          orderBy: { clockIn: 'desc' },
        },
        assignments: {
          select: {
            id: true,
            status: true,
            title: true,
          },
        },
      },
    });

    return users.map(user => {
      const completedTasks = user.assignments.filter(a => a.status === 'COMPLETED').length;
      const currentTask = user.assignments.find(a => a.status === 'IN_PROGRESS' || a.status === 'UPCOMING');

      // Calculate hours worked for the current week
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const hoursWorked = (user.clockLogs || [])
        .filter(log => log.clockIn && new Date(log.clockIn) >= startOfWeek)
        .reduce((sum, log) => sum + (log.regularHours ?? 0) + (log.overtimeHours ?? 0), 0);

      // Use user.status field if present, otherwise fallback to clock log
      let status = user.status || 'offline';
      if (!user.status && user.clockLogs && user.clockLogs.length > 0) {
        const latestLog = user.clockLogs[0]; // ordered by clockIn desc
        if (latestLog.clockIn && !latestLog.clockOut) {
          status = 'active';
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        status,
        currentTask: currentTask?.title || '',
        tasksCompleted: completedTasks,
        hoursWorked: Number(hoursWorked),
        lastClockIn: user.clockLogs[0]?.clockIn
          ? new Date(user.clockLogs[0].clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'N/A',
      };
    });
  }

  async getCleanerTasks(cleanerId: string) {
    const tasks = await this.prisma.assignment.findMany({
      where: { employeeId: cleanerId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        workplace: { select: { name: true } },
        createdAt: true,
        estimatedHours: true,
      },
    });

    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      workplace: task.workplace?.name || '',
      createdAt: task.createdAt,
      estimatedDuration: task.estimatedHours,
      // Add any other fields you need
    }));
  }

  async getTaskReports(supervisorId: string) {
    const tasks = await this.prisma.assignment.findMany({
      where: { employee: { supervisorId } },
      select: {
        id: true,
        title: true,
        status: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        employee: { select: { name: true } },
        workplace: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map(task => ({
      id: task.id,
      task: task.title,
      assignee: task.employee?.name || 'N/A',
      status: task.status,
      completedDate: task.status === 'COMPLETED' && task.updatedAt
        ? task.updatedAt.toISOString().slice(0, 10)
        : '-',
      workplace: task.workplace?.name || '',
    }));
  }

  async getAttendanceReports(supervisorId: string) {
    // Get all employees under this supervisor
    const users = await this.prisma.user.findMany({
      where: { supervisorId, role: 'EMPLOYEE' },
      select: {
        id: true,
        name: true,
        clockLogs: {
          orderBy: { clockIn: 'desc' },
          select: {
            clockIn: true,
            clockOut: true,
            regularHours: true,
            overtimeHours: true,
          },
        },
      },
    });

    // Flatten logs for all users
    let attendance: any[] = [];
    users.forEach(user => {
      user.clockLogs.forEach(log => {
        attendance.push({
          employee: user.name,
          date: log.clockIn ? log.clockIn.toISOString().slice(0, 10) : '',
          checkIn: log.clockIn ? new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          checkOut: log.clockOut ? new Date(log.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          hours: ((log.regularHours ?? 0) + (log.overtimeHours ?? 0)).toFixed(2),
        });
      });
    });

    // Add an id for frontend key
    attendance = attendance.map((a, i) => ({ id: i + 1, ...a }));
    return attendance;
  }

  async getPerformanceReports(supervisorId: string) {
    // Get all employees under this supervisor
    const users = await this.prisma.user.findMany({
      where: { supervisorId, role: 'EMPLOYEE' },
      select: {
        id: true,
        name: true,
        assignments: {
          select: {
            status: true,
          },
        },
      },
    });

    return users.map((user, i) => {
      const tasksCompleted = user.assignments.filter(a => a.status === 'COMPLETED').length;
      const tasksAssigned = user.assignments.length;
      const efficiency = tasksAssigned > 0 ? ((tasksCompleted / tasksAssigned) * 100).toFixed(1) + '%' : '0%';
      let rating = 'Average';
      if (parseFloat(efficiency) >= 95) rating = 'Excellent';
      else if (parseFloat(efficiency) >= 90) rating = 'Good';

      return {
        id: i + 1,
        employee: user.name,
        tasksCompleted,
        tasksAssigned,
        efficiency,
        rating,
      };
    });
  }

  async getSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
        role: true,
        notificationSettings: true,
        themeSettings: true,
      },
    });
    return user;
  }

  async updateProfile(userId: string, dto: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
      },
      select: { name: true, email: true, phone: true },
    });
  }

  async updateNotifications(userId: string, dto: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        notificationSettings: dto,
      },
      select: { notificationSettings: true },
    });
  }

  async updateTheme(userId: string, dto: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        themeSettings: dto,
      },
      select: { themeSettings: true },
    });
  }

  async updatePassword(userId: string, dto: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password is incorrect');
    if (dto.newPassword !== dto.confirmPassword)
      throw new BadRequestException('Passwords do not match');
    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });
    return { message: 'Password updated successfully' };
  }
}
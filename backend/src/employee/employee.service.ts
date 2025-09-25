import { Injectable } from '@nestjs/common';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

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
          profilePicture: true,
          cvUrl: true,
        },
      });
      return {
        ...user,
        profilePictureUrl: user?.profilePicture || null,
        cvUrl: user?.cvUrl || null,
      };
    }

  async getDashboardData(userId: string, date?: string) {
    const today = date || new Date().toISOString().split('T')[0];

    // --- Today ---
    const todayLogs = await this.prisma.clockLog.findMany({
      where: {
        employeeId: userId,
        clockIn: {
          gte: new Date(today + "T00:00:00.000Z"),
          lte: new Date(today + "T23:59:59.999Z"),
        },
      },
    });
    const punchInHours = todayLogs.reduce(
      (sum, log) => sum + (log.regularHours || 0) + (log.overtimeHours || 0),
      0
    );

    // --- Yesterday ---
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
    const yesterdayLogs = await this.prisma.clockLog.findMany({
      where: {
        employeeId: userId,
        clockIn: {
          gte: new Date(yesterdayStr + "T00:00:00.000Z"),
          lte: new Date(yesterdayStr + "T23:59:59.999Z"),
        },
      },
    });
    const punchInHoursYesterday = yesterdayLogs.reduce(
      (sum, log) => sum + (log.regularHours || 0) + (log.overtimeHours || 0),
      0
    );

    // --- Weekly ---
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekLogs = await this.prisma.clockLog.findMany({
      where: {
        employeeId: userId,
        clockIn: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });
    const weeklyHours = weekLogs.reduce(
      (sum, log) => sum + (log.regularHours || 0) + (log.overtimeHours || 0),
      0
    );

    // --- Last Week ---
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(weekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekEnd);
    lastWeekEnd.setDate(weekEnd.getDate() - 7);

    const lastWeekLogs = await this.prisma.clockLog.findMany({
      where: {
        employeeId: userId,
        clockIn: {
          gte: lastWeekStart,
          lte: lastWeekEnd,
        },
      },
    });
    const weeklyHoursLastWeek = lastWeekLogs.reduce(
      (sum, log) => sum + (log.regularHours || 0) + (log.overtimeHours || 0),
      0
    );

    // --- Assignments ---
    const assignments = await this.prisma.assignment.findMany({
      where: { employeeId: userId },
      orderBy: { dueDate: 'asc' },
      include: { workplace: true },
    });

    // --- Today To Do/Done ---
    const totalToDo = assignments.filter(a => a.status !== 'COMPLETED' && a.dueDate?.toISOString().split('T')[0] === today).length;
    const totalDone = assignments.filter(a => a.status === 'COMPLETED' && a.dueDate?.toISOString().split('T')[0] === today).length;

    // --- Yesterday To Do/Done ---
    const totalToDoYesterday = assignments.filter(a => a.status !== 'COMPLETED' && a.dueDate?.toISOString().split('T')[0] === yesterdayStr).length;
    const totalDoneYesterday = assignments.filter(a => a.status === 'COMPLETED' && a.dueDate?.toISOString().split('T')[0] === yesterdayStr).length;

    // --- Attendance logs ---
    const attendanceLogs = await this.prisma.clockLog.findMany({
      where: { employeeId: userId },
      orderBy: { clockIn: 'desc' },
      take: 5,
    });
    const attendance = attendanceLogs.map(log => ({
      id: log.id,
      clockIn: log.clockIn.toISOString(),
      clockOut: log.clockOut ? log.clockOut.toISOString() : "",
      createdAt: log.createdAt.toISOString(),
    }));

    return {
      punchInHours,
      punchInHoursYesterday,
      weeklyHours,
      weeklyHoursLastWeek,
      totalToDo,
      totalToDoYesterday,
      totalDone,
      totalDoneYesterday,
      assignments: assignments.map(a => {
        const start = a.startTime ? new Date(a.startTime) : null;
        const end = a.endTime ? new Date(a.endTime) : null;
        let duration = "";
        if (start && end) {
          const diffMs = end.getTime() - start.getTime();
          const diffHours = (diffMs / (1000 * 60 * 60)).toFixed(2);
          duration = `${diffHours} hours`;
        }
        return {
          id: a.id,
          workplace: a.workplace?.name || a.location || '',
          description: a.description ?? "",
          date: a.dueDate ? a.dueDate.toISOString().split('T')[0] : "",
          startTime: a.startTime ? a.startTime.toISOString().split('T')[1]?.slice(0,5) : "",
          endTime: a.endTime ? a.endTime.toISOString().split('T')[1]?.slice(0,5) : "",
          duration,
          status: a.status,
          priority: a.priority ?? "",
          specialInstructions: a.specialInstructions ?? "",
          completedAt: a.completedAt ? a.completedAt.toISOString() : null,
        };
      }),
      attendance,
    };
  }

  async getRecentAttendance(userId: string) {
    const logs = await this.prisma.clockLog.findMany({
      where: { employeeId: userId },
      orderBy: { clockIn: 'desc' },
      take: 5,
    });
    return logs.map(log => ({
      id: log.id,
      clockIn: log.clockIn.toISOString(),
      clockOut: log.clockOut ? log.clockOut.toISOString() : "",
      createdAt: log.createdAt.toISOString(),
    }));
  }

  async getUpcomingSchedule(userId: string) {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    // Find assignments where either startTime or dueDate is in the future
    const assignments = await this.prisma.assignment.findMany({
      where: {
        employeeId: userId,
        OR: [
          { startTime: { gt: now } },
          { dueDate: { gt: now } },
        ],
      },
      orderBy: [
        { startTime: 'asc' },
        { dueDate: 'asc' },
      ],
      take: 5,
      include: { workplace: true },
    });
    return assignments.map(a => {
      let status = a.status;
      // Use dueDate for status logic if present, else fallback to startTime
      let compareDate: Date | null = a.dueDate ?? a.startTime ?? null;
      if (compareDate) {
        const compareDateStr = compareDate.toISOString().split('T')[0];
        if (compareDateStr > todayStr) {
          status = 'UPCOMING';
        } else if (compareDateStr <= todayStr && a.status !== 'COMPLETED') {
          status = 'PENDING';
        }
      }
      return {
        date: a.startTime ? a.startTime.toISOString().split('T')[0] : (a.dueDate ? a.dueDate.toISOString().split('T')[0] : ""),
        workplace: a.workplace?.name || a.location || '',
        time: a.startTime ? a.startTime.toISOString().split('T')[1]?.slice(0,5) : "",
        type: a.type ?? "",
        notes: a.notes ?? "",
        status,
      };
    });
  }

  async getAllAssignments(userId: string) {
    const assignments = await this.prisma.assignment.findMany({
      where: {
        employeeId: userId,
      },
      orderBy: { dueDate: 'asc' },
      include: { workplace: true },
    });

    return assignments.map((a) => {
      let duration = '';
      if (a.startTime && a.endTime) {
        const start = new Date(a.startTime);
        const end = new Date(a.endTime);
        const diffMs = end.getTime() - start.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        duration = `${diffHours.toFixed(2)}h`;
      } else if (a.estimatedHours) {
        duration = `${a.estimatedHours}h`;
      }

      return {
        id: a.id,
        workplace: a.workplace?.name || a.location || '',
        description: a.description ?? '',
        date: a.dueDate ? a.dueDate.toISOString().split('T')[0] : '',
        startTime: a.startTime ? a.startTime.toISOString().split('T')[1]?.slice(0, 5) : '',
        endTime: a.endTime ? a.endTime.toISOString().split('T')[1]?.slice(0, 5) : '',
        duration,
        status: a.status.toLowerCase(),
        priority: a.priority ?? '',
        specialInstructions: a.specialInstructions ?? null,
        completedAt: a.completedAt ? a.completedAt.toISOString() : null,
      };
    });
  }

  async clockInToTask(userId: string, taskId: string) {
  const task = await this.prisma.assignment.findUnique({ where: { id: taskId }, include: { workplace: true } });
    if (!task || task.employeeId !== userId) {
      throw new Error('Task not found or unauthorized');
    }

    // Update assignment status and startTime
    await this.prisma.assignment.update({
      where: { id: taskId },
      data: {
        status: 'IN_PROGRESS',
        startTime: new Date(),
      },
    });

    // Create a new ClockLog for this punch in
    await this.prisma.clockLog.create({
      data: {
        employeeId: userId,
        clockIn: new Date(),
        location: typeof task.workplace === 'object' && task.workplace?.name ? task.workplace.name : task.location,
        regularHours: 0,
        overtimeHours: 0,
      },
    });

    return { message: 'Clocked in' };
  }

  async clockOutFromTask(userId: string, taskId: string) {
  const task = await this.prisma.assignment.findUnique({ where: { id: taskId }, include: { workplace: true } });
    if (!task || task.employeeId !== userId) {
      throw new Error('Task not found or unauthorized');
    }

    // Update assignment status, completedAt, and endTime
    await this.prisma.assignment.update({
      where: { id: taskId },
      data: {
        status: 'REVIEW',
        completedAt: new Date(),
        endTime: new Date(),
      },
    });

    // Find the latest open ClockLog for this user (no clockOut yet)
    const openLog = await this.prisma.clockLog.findFirst({
      where: {
        employeeId: userId,
        clockOut: null,
      },
      orderBy: { clockIn: 'desc' },
    });

    if (openLog) {
      const clockOutTime = new Date();
      const diffMs = clockOutTime.getTime() - openLog.clockIn.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      await this.prisma.clockLog.update({
        where: { id: openLog.id },
        data: {
          clockOut: clockOutTime,
          regularHours: diffHours,
          overtimeHours: 0, // You can add overtime logic if needed
        },
      });
    }

    return { message: 'Clocked out' };
  }

  async getAttendanceHistory(userId: string) {
    const logs = await this.prisma.clockLog.findMany({
      where: { employeeId: userId },
      orderBy: { clockIn: 'desc' },
      include: { assignment: { include: { workplace: true } } },
    });

    type Segment = { logId: string; start: Date; end: Date; hours: number; key: string };
    const ymd = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${da}`;
    };

    const segmentsByDay = new Map<string, Segment[]>();
    const totalHoursByLog = new Map<string, number>();
    const overtimeByLog = new Map<string, number>();
    const sundayHoursByLog = new Map<string, number>();
    const weekdayOvertimeByLog = new Map<string, number>();

    // Build day-constrained segments for each log so we can compute daily overtime correctly
    for (const log of logs) {
      const start = log.assignment?.startTime ? new Date(log.assignment.startTime) : new Date(log.clockIn);
      const end = log.assignment?.endTime ? new Date(log.assignment.endTime) : (log.clockOut ? new Date(log.clockOut) : null);
      if (!end || end <= start) continue;

      let segStart = start;
      while (segStart < end) {
        const boundary = endOfDay(segStart);
        const segEnd = boundary < end ? boundary : end;
        const hours = (segEnd.getTime() - segStart.getTime()) / (1000 * 60 * 60);
        const key = ymd(segStart);
        const seg: Segment = { logId: log.id, start: segStart, end: segEnd, hours, key };
        const arr = segmentsByDay.get(key) || [];
        arr.push(seg);
        segmentsByDay.set(key, arr);
        totalHoursByLog.set(log.id, (totalHoursByLog.get(log.id) || 0) + hours);
        segStart = startOfDay(addDays(segStart, 1));
      }
    }

    // Compute overtime per day and distribute across segments in chronological order
    for (const [key, segs] of segmentsByDay.entries()) {
      segs.sort((a, b) => a.start.getTime() - b.start.getTime());
      const isSunday = segs[0].start.getDay() === 0;
      if (isSunday) {
        for (const s of segs) {
          overtimeByLog.set(s.logId, (overtimeByLog.get(s.logId) || 0) + s.hours);
          sundayHoursByLog.set(s.logId, (sundayHoursByLog.get(s.logId) || 0) + s.hours);
        }
      } else {
        let regularRemaining = 8;
        for (const s of segs) {
          const regular = Math.min(regularRemaining, s.hours);
          const overtime = s.hours - regular;
          regularRemaining -= regular;
          overtimeByLog.set(s.logId, (overtimeByLog.get(s.logId) || 0) + overtime);
          weekdayOvertimeByLog.set(s.logId, (weekdayOvertimeByLog.get(s.logId) || 0) + overtime);
        }
      }
    }

    // Return rows with per-log totals and computed overtime
    return logs.map((log) => {
      const start = log.assignment?.startTime ? new Date(log.assignment.startTime) : new Date(log.clockIn);
      const end = log.assignment?.endTime ? new Date(log.assignment.endTime) : (log.clockOut ? new Date(log.clockOut) : null);
      const totalHours = Number((totalHoursByLog.get(log.id) || 0).toFixed(2));
      const overtime = Number((overtimeByLog.get(log.id) || 0).toFixed(2));
      const sundayHours = Number((sundayHoursByLog.get(log.id) || 0).toFixed(2));
      const weekdayOvertimeHours = Number((weekdayOvertimeByLog.get(log.id) || 0).toFixed(2));

      return {
        id: log.id,
        assignmentTitle: log.assignment?.title ?? '',
        date: start.toISOString().split('T')[0],
        clockIn: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clockOut: end ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
        totalHours,
        workplace: log.assignment?.workplace ? log.assignment.workplace.name : (log.location || log.assignment?.location || 'Unknown'),
        overtime,
        sundayHours,
        weekdayOvertimeHours,
        status: end ? 'completed' : 'pending',
      };
    });
  }

  async saveProfilePicture(userId: string, url: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { profilePicture: url },
      select: { profilePicture: true },
    });
  }

  async saveCV(userId: string, url: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { cvUrl: url },
      select: { cvUrl: true },
    });
  }

  async updateNotifications(userId: string, settings: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { notificationSettings: settings },
      select: { notificationSettings: true },
    });
  }
  async updateTheme(userId: string, settings: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { themeSettings: settings },
      select: { themeSettings: true },
    });
  }
  
  async updatePassword(userId: string, dto: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new Error('Current password is incorrect');
    if (dto.newPassword !== dto.confirmPassword)
      throw new Error('Passwords do not match');
    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });
    return { message: 'Password updated successfully' };
  }
  
  async updateProfile(userId: string, dto: { name?: string; email?: string; phone?: string }) {
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

  async getPaymentSettings() {
    const settings = await this.prisma.paymentSettings.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const regularRate = settings?.regularRate ?? 18.5;
    return {
      regularRate,
      overtimeRate: +(regularRate * 1.5).toFixed(2),
      sundayOvertimeRate: +(regularRate * 2).toFixed(2),
    };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { startOfWeek, endOfWeek, addDays, endOfDay, startOfDay } from 'date-fns';
import { Role } from '@prisma/client';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AdminService {
  // Create a new workplace
  async createWorkplace(body: { name: string; address: string }) {
    if (!body.name || !body.address) {
      throw new BadRequestException('Name and address are required');
    }
    return this.prisma.workplace.create({
      data: {
        name: body.name,
        address: body.address,
      },
    });
  }

  // Get all workplaces
  async getWorkplaces() {
    return this.prisma.workplace.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Assign a new task to a cleaner
  async assignTask(body: {
  cleanerId: string;
  title: string;
  description?: string;
  workplaceId: string;
  priority: string;
  estimatedHours?: string;
  dueDate?: string;
  startTime?: string;
  }) {
    // Find cleaner
    const cleaner = await this.prisma.user.findUnique({
      where: { id: body.cleanerId, role: 'EMPLOYEE' },
    });
    if (!cleaner) throw new BadRequestException('Cleaner not found');

    // Parse startTime to valid Date or null
    let parsedStartTime: Date | null = null;
    if (body.startTime) {
      const dt = new Date(body.startTime);
      if (!isNaN(dt.getTime())) {
        parsedStartTime = dt;
      }
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        employeeId: body.cleanerId,
        title: body.title,
        description: body.description,
        workplaceId: body.workplaceId,
        location: '', // fallback value, update as needed
        priority: body.priority,
        estimatedHours: body.estimatedHours ? Number(body.estimatedHours) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        startTime: parsedStartTime,
        status: 'UPCOMING',
      },
      include: {
        employee: true,
        workplace: true,
      },
    });
    return assignment;
  }

  // Get recent tasks (assignments)
  async getRecentTasks() {
    return this.prisma.assignment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        employee: { select: { name: true } },
      },
    });
  }
  constructor(private prisma: PrismaService, private mailer: MailerService) {}

  // ✅ Create any user (admin, supervisor, cleaner)
  async create(data: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const locationExists = await this.prisma.location.findUnique({
      where: { id: data.locationId },
    });

    if (!locationExists) {
      throw new BadRequestException('Invalid location');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: data.role,
        location: {
          connect: { id: data.locationId },
        },
        ...(data.supervisorId && {
          supervisor: { connect: { id: data.supervisorId } },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        location: true,
        status: true,
        joinDate: true,
        createdAt: true,
      },
    });

    // ✅ Send welcome email with login credentials
    const loginUrl = 'http://localhost:3001/login'; // Update to production URL if needed

    await this.mailer.sendMail(
      user.email,
      `Your ${data.role?.toLowerCase()} account is ready`,
      `
        <h2>Welcome to KNK Palvelut!</h2>
        <p>Hello ${user.name},</p>
        <p>Your account has been created on <strong>KNK Palvelut</strong>.</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Password:</strong> ${data.password}</p>
        <p>You can log in here: <a href="${loginUrl}">${loginUrl}</a></p>
        <p>If you did not request this account, please contact your admin.</p>
        <br/>
        <p>Best regards,<br/>KNK Palvelut Team</p>
      `
    );

    return user;
  }


  // ✅ Admin-only
  async findAll() {
    return this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        joinDate: true,
        status: true,
        createdAt: true,
        location: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { location: true },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, data: Partial<CreateUserDto | UpdateUserDto>) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');

    const updateData: any = { ...data };

    if (data.locationId) {
      updateData.location = {
        connect: { id: data.locationId },
      };
      delete updateData.locationId;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');

    return this.prisma.user.delete({ where: { id } });
  }

  // ✅ Supervisors with their cleaners
  findAllSupervisors() {
    return this.prisma.user.findMany({
      where: { role: 'SUPERVISOR' },
      include: {
        subordinates: {
          select: {
            id: true,
            name: true,
            email: true,
            joinDate: true,
            status: true,
            location: true,
          },
        },
        location: true,
      },
    });
  }

  // ✅ Cleaners with their supervisor
  findAllCleaners() {
    return this.prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      include: {
        supervisor: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        location: true,
      },
    });
  }

  // ✅ Admin dashboard metrics
  async getStats() {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const weekEndExclusive = addDays(weekEnd, 1);

    const totalCleaners = await this.prisma.user.count({
      where: { role: Role.EMPLOYEE },
    });

    const activeAssignments = await this.prisma.assignment.count({
      where: {
        status: { in: ['IN_PROGRESS', 'UPCOMING'] },
      },
    });

    // Build daily aggregates for hours and payroll using Mon–Sat 8h regular + 1.5x overtime, Sunday 2x all hours
    const logs = await this.prisma.clockLog.findMany({
      where: {
        // overlap with the week range
        clockOut: { not: null, gte: weekStart },
        clockIn: { lt: weekEndExclusive },
      },
      select: { clockIn: true, clockOut: true },
      orderBy: { clockIn: 'asc' },
    });

    type DayAgg = { hours: number; isSunday: boolean };
    const daily: Record<string, DayAgg> = {};
    const ymd = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${da}`;
    };

    for (const log of logs) {
      const start = new Date(log.clockIn);
      const end = log.clockOut ? new Date(log.clockOut) : null;
      if (!end || end <= start) continue;

      // clamp to week boundaries
      let segStart = start < weekStart ? weekStart : start;
      const hardEnd = end > weekEndExclusive ? weekEndExclusive : end;

      while (segStart < hardEnd) {
        const boundary = endOfDay(segStart);
        const segEnd = boundary < hardEnd ? boundary : hardEnd;
        const hours = (segEnd.getTime() - segStart.getTime()) / (1000 * 60 * 60);
        const key = ymd(segStart);
        const isSunday = segStart.getDay() === 0;
        if (!daily[key]) daily[key] = { hours: 0, isSunday };
        daily[key].hours += hours;
        segStart = startOfDay(addDays(segStart, 1));
      }
    }

    const { regularRate, overtimeRate, sundayOvertimeRate } = await this.getPaymentSettings();

    let hoursThisWeek = 0;
    let totalPay = 0;
    for (const key of Object.keys(daily)) {
      const { hours, isSunday } = daily[key];
      hoursThisWeek += hours;
      if (isSunday) {
        totalPay += hours * sundayOvertimeRate;
      } else {
        const regular = Math.min(8, hours);
        const overtime = Math.max(0, hours - 8);
        totalPay += regular * regularRate + overtime * overtimeRate;
      }
    }

    return {
      totalCleaners,
      activeAssignments,
      hoursThisWeek,
      payrollThisWeek: totalPay,
    };
  }

  // ✅ Last 5 clock-ins
  async getRecentActivity() {
    return this.prisma.clockLog.findMany({
      take: 5,
      orderBy: { clockIn: 'desc' },
      include: {
        User: {
          select: {
            name: true,
            location: true,
          },
        },
      },
    });
  }

  // ✅ 5 most recent assignments not completed
  async getAssignments() {
    const assignments = await this.prisma.assignment.findMany({
      where: { status: { not: 'COMPLETED' } },
      include: {
        employee: { select: { name: true } },
        workplace: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    return assignments.map(a => ({
      workplace: a.workplace?.name || a.location || '',
      cleaner: a.employee?.name || '',
      status: a.status,
      priority: a.priority || '',
    }));
  }
  
  async getCleanerDetail(id: string) {
    // 1. Get cleaner info
    const cleaner = await this.prisma.user.findUnique({
      where: { id },
      include: {
        location: true,
        supervisor: true,
      },
    });
    if (!cleaner) throw new NotFoundException('Cleaner not found');

    // 2. Get recent work logs (ClockLog)
    const logs = await this.prisma.clockLog.findMany({
      where: { employeeId: id },
      orderBy: { clockIn: 'desc' },
      take: 200, // fetch more to build daily aggregates
    });

    // 3. Build daily aggregates and compute regular vs overtime using rules:
    //    - Mon–Sat: >8 hours/day is overtime (1.5x)
    //    - Sunday: all hours are overtime (2x)
    type DayAgg = { hours: number; isSunday: boolean; date: string };
    const ymd = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${da}`;
    };
    const dailyMap = new Map<string, DayAgg>();
    for (const log of logs) {
      const start = new Date(log.clockIn);
      const end = log.clockOut ? new Date(log.clockOut) : null;
      if (!end || end <= start) continue;
      let segStart = start;
      while (segStart < end) {
        const boundary = endOfDay(segStart);
        const segEnd = boundary < end ? boundary : end;
        const hours = (segEnd.getTime() - segStart.getTime()) / (1000 * 60 * 60);
        const key = ymd(segStart);
        const isSunday = segStart.getDay() === 0;
        const existing = dailyMap.get(key);
        if (existing) {
          existing.hours += hours;
        } else {
          dailyMap.set(key, { hours, isSunday, date: segStart.toISOString() });
        }
        segStart = startOfDay(addDays(segStart, 1));
      }
    }

    // Sort and limit recent 30 days
    const dailyRecords = Array.from(dailyMap.values()).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 30);

    const computedRecords = dailyRecords.map((d) => {
      if (d.isSunday) {
        return { date: d.date, hours: 0, overtime: +d.hours.toFixed(2), isSunday: true };
      }
      const regular = Math.min(8, d.hours);
      const overtime = Math.max(0, d.hours - 8);
      return { date: d.date, hours: +regular.toFixed(2), overtime: +overtime.toFixed(2), isSunday: false };
    });

    // 4. Payment settings: use cleaner's rate if set, else global
    const globalRates = await this.getPaymentSettings();
    const effectiveRegularRate = cleaner.hourlyRate ?? globalRates.regularRate;
    const paymentSettings = {
      regularRate: effectiveRegularRate,
      overtimeRate: +(effectiveRegularRate * 1.5).toFixed(2),
      sundayOvertimeRate: +(effectiveRegularRate * 2).toFixed(2),
    };

    // 4. Calculate stats
    const tasksCompleted = await this.prisma.assignment.count({
      where: { employeeId: id, status: 'COMPLETED' },
    });

    // Aggregate totals from computed daily records
    const totalRegular = computedRecords.reduce((s, r) => s + (r.hours || 0), 0);
    const totalOvertime = computedRecords.reduce((s, r) => s + (r.overtime || 0), 0);

    // Monthly average (approximation: recent 30 days / ~3 months)
    const totalMonths = 3;
    const monthlyAverage = Math.round((totalRegular + totalOvertime) / totalMonths);

    return {
      id: cleaner.id,
      name: cleaner.name,
      email: cleaner.email,
      phone: cleaner.phone,
      location: cleaner.location?.name,
      supervisor: cleaner.supervisor?.name,
      joinDate: cleaner.joinDate,
      status: cleaner.status,
      tasksCompleted,
      totalHours: +totalRegular.toFixed(2),
      overtimeHours: +totalOvertime.toFixed(2),
      monthlyAverage,
      workRecords: computedRecords,
      paymentSettings,
    };
  }

  async getSupervisorDetail(id: string) {
    // Fetch supervisor with location and subordinates (cleaners)
    const supervisor = await this.prisma.user.findUnique({
      where: { id },
      include: {
        location: true,
        subordinates: {
          include: {
            location: true,
          },
        },
      },
    });

    if (!supervisor || supervisor.role !== 'SUPERVISOR') {
      throw new NotFoundException('Supervisor not found');
    }

    // Map assigned cleaners
    const assignedCleaners = supervisor.subordinates.map((cleaner) => ({
      id: cleaner.id,
      name: cleaner.name,
      email: cleaner.email,
      phone: cleaner.phone,
      location: cleaner.location?.name || '',
      supervisor: supervisor.name,
      joinDate: cleaner.joinDate,
      status: cleaner.status,
      tasksCompleted: 0, // TODO: Replace with real task count if available
    }));

    // Calculate stats
    const totalTasks = assignedCleaners.reduce((sum, c) => sum + (c.tasksCompleted || 0), 0);
    const avgTasks = assignedCleaners.length ? Math.round(totalTasks / assignedCleaners.length) : 0;

    return {
      id: supervisor.id,
      name: supervisor.name,
      email: supervisor.email,
      phone: supervisor.phone,
      location: supervisor.location?.name || '',
      joinDate: supervisor.joinDate,
      status: supervisor.status,
      assignedCleaners,
      stats: {
        assignedCleaners: assignedCleaners.length,
        totalTasks,
        avgTasks,
      },
    };
  }

  // Task Reports
  async getTaskReports() {
    const assignments = await this.prisma.assignment.findMany({
      include: {
        employee: true,
        workplace: true,
      },
    });
    return assignments.map(a => ({
      id: a.id,
      task: a.title,
      assignee: a.employee?.name || '',
      status: a.status,
      completedDate: a.status === 'COMPLETED' && a.updatedAt ? a.updatedAt.toISOString().split('T')[0] : '-',
      workplace: a.workplace?.name || '',
    }));
  }

  // Attendance Reports
  async getAttendanceReports() {
    const logs = await this.prisma.clockLog.findMany({
      include: {
        User: true,
      },
    });
    return logs.map(l => ({
      id: l.id,
      employee: l.User?.name || '',
      checkIn: l.clockIn ? new Date(l.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      checkOut: l.clockOut ? new Date(l.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      date: l.clockIn ? new Date(l.clockIn).toISOString().split('T')[0] : '',
      hours: ((l.regularHours || 0) + (l.overtimeHours || 0)).toFixed(2),
    }));
  }

  // Performance Reports
  async getPerformanceReports() {
    // Example: count assignments per employee
    const users = await this.prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      include: {
        assignments: true,
      },
    });
    return users.map(u => {
      const tasksCompleted = u.assignments.filter(a => a.status === 'COMPLETED').length;
      const tasksAssigned = u.assignments.length;
      const efficiency = tasksAssigned ? ((tasksCompleted / tasksAssigned) * 100).toFixed(1) + '%' : '0%';
      let rating = 'Average';
      if (parseFloat(efficiency) >= 95) rating = 'Excellent';
      else if (parseFloat(efficiency) >= 90) rating = 'Good';
      return {
        id: u.id,
        employee: u.name,
        tasksCompleted,
        tasksAssigned,
        efficiency,
        rating,
      };
    });
  }

  async getPaymentSettings() {
    const settings = await this.prisma.paymentSettings.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const regularRate = settings?.regularRate ?? 25.0;
    return {
      regularRate,
      overtimeRate: +(regularRate * 1.5).toFixed(2), // Mon–Sat overtime
      sundayOvertimeRate: +(regularRate * 2).toFixed(2), // Sunday overtime
    };
  }

  async updatePaymentSettings(data: { regularRate: number }) {
    return this.prisma.paymentSettings.create({
      data: {
        regularRate: data.regularRate,
        overtimeRate: +(data.regularRate * 1.5).toFixed(2), // required by schema
        // You can add effectiveFrom: new Date() if you want to track when the rate starts
      },
    });
  }

  // Get all cleaners for dropdown
  async getAllCleanersForSalaryCalculator() {
    const rates = await this.getPaymentSettings();
    const cleaners = await this.prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: { id: true, name: true, hourlyRate: true },
    });
    // Fallback to global regular rate if cleaner's hourlyRate is not set
    return cleaners.map((c) => ({
      ...c,
      hourlyRate: c.hourlyRate ?? rates.regularRate,
    }));
  }

  // Calculate salary for a cleaner in a date range
  async calculateSalary(params: { cleanerId: string; startDate: string; endDate: string }) {
    const { cleanerId, startDate, endDate } = params;
    const cleaner = await this.prisma.user.findUnique({
      where: { id: cleanerId },
      select: { id: true, name: true, hourlyRate: true },
    });
    if (!cleaner) throw new Error('Cleaner not found');

    // Get time entries (ClockLog) for the period
    // Make endDate inclusive by advancing by 1 day and using lt
    const endExclusive = addDays(new Date(endDate), 1);
    const timeEntries = await this.prisma.clockLog.findMany({
      where: {
        employeeId: cleanerId,
        clockIn: { gte: new Date(startDate) },
        clockOut: { lt: endExclusive },
      },
      orderBy: { clockIn: 'asc' },
    });

    // Compute totals from raw times applying business rules:
    // - Mon–Sat: > 8 hours/day is overtime (1.5x)
    // - Sunday: all hours are overtime (2x)
    type DayAgg = { hours: number; isSunday: boolean };
    const daily: Record<string, DayAgg> = {};

    // Helper to build a local YYYY-MM-DD key
    const ymd = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${da}`;
    };

    for (const entry of timeEntries) {
      const start = new Date(entry.clockIn);
      const end = entry.clockOut ? new Date(entry.clockOut) : null;
      if (!end || end <= start) continue;

      // Split across day boundaries to attribute hours per day
      let segStart = startOfDay(start) > start ? start : start; // ensure segStart is actual start
      while (segStart < end) {
        const boundary = endOfDay(segStart);
        const segEnd = boundary < end ? boundary : end;
        const hours = (segEnd.getTime() - segStart.getTime()) / (1000 * 60 * 60);
        const key = ymd(segStart);
        const isSunday = segStart.getDay() === 0;
        if (!daily[key]) daily[key] = { hours: 0, isSunday };
        daily[key].hours += hours;
        // Advance to next day start
        segStart = startOfDay(addDays(segStart, 1));
      }
    }

    let totalRegularHours = 0;
    let totalOvertimeHours = 0;
    let regularPay = 0;
    let overtimePay = 0;

    // Determine effective rates (use cleaner's rate if present, else global)
    const { regularRate } = await this.getPaymentSettings();
    const effectiveRegularRate = cleaner.hourlyRate ?? regularRate ?? 25.0;
    const effectiveOvertimeRate = effectiveRegularRate * 1.5; // Mon–Sat overtime
    const effectiveSundayRate = effectiveRegularRate * 2; // Sunday overtime

    for (const key of Object.keys(daily)) {
      const { hours, isSunday } = daily[key];
      if (isSunday) {
        totalOvertimeHours += hours;
        overtimePay += hours * effectiveSundayRate;
      } else {
        const regular = Math.min(8, hours);
        const overtime = Math.max(0, hours - 8);
        totalRegularHours += regular;
        totalOvertimeHours += overtime;
        regularPay += regular * effectiveRegularRate;
        overtimePay += overtime * effectiveOvertimeRate;
      }
    }

    return {
      cleanerId: cleaner.id,
      cleanerName: cleaner.name,
      totalRegularHours,
      totalOvertimeHours,
      regularPay,
      overtimePay,
      totalPay: regularPay + overtimePay,
    };
  }

  async getSettings(userId: string) {
    return this.prisma.user.findUnique({
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
  }

  async updateProfile(userId: string, data: { name?: string; email?: string; phone?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { name: true, email: true, phone: true },
    });
  }

  async updateNotifications(userId: string, notificationSettings: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { notificationSettings },
      select: { notificationSettings: true },
    });
  }

  async updateTheme(userId: string, themeSettings: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { themeSettings },
      select: { themeSettings: true },
    });
  }

  async changePassword(userId: string, body: { currentPassword: string; newPassword: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    const passwordMatch = await bcrypt.compare(body.currentPassword, user.password);
    if (!passwordMatch) throw new Error('Current password is incorrect');
    const hashed = await bcrypt.hash(body.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { message: 'Password updated successfully' };
  }
}

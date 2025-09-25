import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  // Assign a new task to a cleaner
  @Post('assign-task')
  async assignTask(@Body() body: {
  cleanerId: string;
  title: string;
  description?: string;
  workplaceId: string;
  priority: string;
  estimatedHours?: string;
  dueDate?: string;
  startTime?: string;
  }) {
    return this.adminService.assignTask(body);
  }

  // Get recent tasks (assignments)
  @Get('recent-tasks')
  async getRecentTasks() {
    return this.adminService.getRecentTasks();
  }
  constructor(private readonly adminService: AdminService) {}

  // Create a new workplace
  @Post('workplaces')
  async createWorkplace(@Body() body: { name: string; address: string }) {
    return this.adminService.createWorkplace(body);
  }

  // Get all workplaces
  @Get('workplaces')
  async getWorkplaces() {
    return this.adminService.getWorkplaces();
  }

  // ✅ Create new user (admin/supervisor/cleaner)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.adminService.create(createUserDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }

  // ✅ Dashboard statistics
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // ✅ Recent clock-ins
  @Get('recent-activity')
  getRecentActivity() {
    return this.adminService.getRecentActivity();
  }

  // ✅ Active assignments
  @Get('assignments')
  getAssignments() {
    return this.adminService.getAssignments();
  }

  // ✅ All supervisors + their cleaners
  @Get('supervisors')
  findAllSupervisors() {
    return this.adminService.findAllSupervisors();
  }

  // ✅ All cleaners + their supervisor
  @Get('cleaners')
  findAllCleaners() {
    return this.adminService.findAllCleaners();
  }

  // ✅ Get all admins
  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  // ✅ Task reports
  @Get('reports/tasks')
  getTaskReports() {
    return this.adminService.getTaskReports();
  }

  // ✅ Attendance reports
  @Get('reports/attendance')
  getAttendanceReports() {
    return this.adminService.getAttendanceReports();
  }

  // ✅ Performance reports
  @Get('reports/performance')
  getPerformanceReports() {
    return this.adminService.getPerformanceReports();
  }

  // ✅ Get payment settings for a cleaner
  @Get('payment-settings')
  getPaymentSettings() {
    return this.adminService.getPaymentSettings();
  }

  // ✅ Update payment settings for a cleaner
  @Post('payment-settings')
  updatePaymentSettings(@Body() body: { regularRate: number }) {
    return this.adminService.updatePaymentSettings(body);
  }

  // ✅ Get a single cleaner's detail (info, work records, payment settings)
  @Get('cleaner/:id')
  getCleanerDetail(@Param('id') id: string) {
    return this.adminService.getCleanerDetail(id);
  }

  // ✅ Get a single supervisor's detail (info, work records, payment settings)
  @Get('supervisor/:id')
  getSupervisorDetail(@Param('id') id: string) {
    return this.adminService.getSupervisorDetail(id);
  }

  // Get all cleaners for dropdown
  @Get('salary-calculator/cleaners')
  getAllCleaners() {
    return this.adminService.getAllCleanersForSalaryCalculator();
  }

  // Calculate salary for a cleaner in a date range
  @Get('salary-calculator/calculate')
  async calculateSalary(
    @Query('cleanerId') cleanerId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.adminService.calculateSalary({
      cleanerId,
      startDate,
      endDate,
    });
  }

  // Get current admin's settings
  @Get('settings')
  async getSettings(@Req() req: Request) {
    if (!req.user) throw new UnauthorizedException('User not authenticated');
    return this.adminService.getSettings((req.user as any)['sub']);
  }

  // Update profile info
  @Patch('settings/profile')
  async updateProfile(
    @Req() req: Request,
    @Body() body: {
      name?: string;
      email?: string;
      phone?: string;
    },
  ) {
    if (!req.user) throw new UnauthorizedException('User not authenticated');
    return this.adminService.updateProfile((req.user as any)['sub'], body);
  }

  // Update notification preferences
  @Patch('settings/notifications')
  async updateNotifications(@Req() req: Request, @Body() body: any) {
    if (!req.user) throw new UnauthorizedException('User not authenticated');
    return this.adminService.updateNotifications((req.user as any)['sub'], body);
  }

  // Update theme preferences
  @Patch('settings/theme')
  async updateTheme(@Req() req: Request, @Body() body: any) {
    if (!req.user) throw new UnauthorizedException('User not authenticated');
    return this.adminService.updateTheme((req.user as any)['sub'], body);
  }

  // Change password
  @Patch('settings/password')
  async changePassword(
    @Req() req: Request,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    if (!req.user) throw new UnauthorizedException('User not authenticated');
    return this.adminService.changePassword((req.user as any)['sub'], body);
  }

  // ✅ Get a single user by ID (put this LAST)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }
}

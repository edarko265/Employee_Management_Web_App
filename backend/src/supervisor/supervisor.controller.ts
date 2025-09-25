import { Workplace } from '@prisma/client';
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { SupervisorService } from './supervisor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('supervisor')
@UseGuards(JwtAuthGuard)
export class SupervisorController {
  @Post('mark-task-complete/:taskId')
  async markTaskComplete(@Param('taskId') taskId: string, @Req() req) {
    const supervisorId = req.user?.sub || req.user?.id;
    return this.supervisorService.markTaskComplete(supervisorId, taskId);
  }
  @Get('workplaces')
  async getWorkplaces(@Req() req: Request): Promise<Workplace[]> {
    return this.supervisorService.getWorkplaces();
  }
  constructor(private readonly supervisorService: SupervisorService) {}

  @Get('dashboard')
  async getDashboard(@Req() req: Request) {
    const user = req.user as { sub?: string; id?: string };
    const supervisorId = user.sub || user.id;
    if (!supervisorId) throw new Error('Missing supervisorId');
    return this.supervisorService.getDashboardData(supervisorId);
  }

  @Get('cleaners')
  async getCleaners(@Req() req: Request) {
    return this.supervisorService.getCleaners((req.user as any)['sub']);
  }

  @Get('recent-tasks')
  async getRecentTasks(@Req() req: Request) {
    return this.supervisorService.getRecentTasks((req.user as any)['sub']);
  }

  @Post('assign-task')
  async assignTask(@Req() req: Request, @Body() body: any) {
    return this.supervisorService.assignTask((req.user as any)['sub'], body);
  }

  @Get('team')
  async getTeam(@Req() req) {
    const supervisorId = req.user?.sub || req.user?.id;
    return this.supervisorService.getTeamMembers(supervisorId);
  }

  @Get('cleaner-tasks/:cleanerId')
  async getCleanerTasks(@Param('cleanerId') cleanerId: string, @Req() req) {
    // Optionally, check if this cleaner belongs to the supervisor
    return this.supervisorService.getCleanerTasks(cleanerId);
  }

  @Get('report/tasks')
  async getTaskReports(@Req() req) {
    const supervisorId = req.user?.sub || req.user?.id;
    return this.supervisorService.getTaskReports(supervisorId);
  }

  @Get('report/attendance')
  async getAttendanceReports(@Req() req) {
    const supervisorId = req.user?.sub || req.user?.id;
    return this.supervisorService.getAttendanceReports(supervisorId);
  }

  @Get('report/performance')
  async getPerformanceReports(@Req() req) {
    const supervisorId = req.user?.sub || req.user?.id;
    return this.supervisorService.getPerformanceReports(supervisorId);
  }

  // Settings endpoints
  @Get('settings')
  async getSettings(@Req() req) {
    const userId = req.user?.sub || req.user?.id;
    return this.supervisorService.getSettings(userId);
  }

  @Put('settings/profile')
  async updateProfile(@Req() req, @Body() dto: any) {
    const userId = req.user?.sub || req.user?.id;
    return this.supervisorService.updateProfile(userId, dto);
  }

  @Put('settings/notifications')
  async updateNotifications(@Req() req, @Body() dto: any) {
    const userId = req.user?.sub || req.user?.id;
    return this.supervisorService.updateNotifications(userId, dto);
  }

  @Put('settings/theme')
  async updateTheme(@Req() req, @Body() dto: any) {
    const userId = req.user?.sub || req.user?.id;
    return this.supervisorService.updateTheme(userId, dto);
  }

  @Put('settings/password')
  async updatePassword(@Req() req, @Body() dto: any) {
    const userId = req.user?.sub || req.user?.id;
    return this.supervisorService.updatePassword(userId, dto);
  }
}
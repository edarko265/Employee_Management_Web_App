import {
  Controller,
  Get,
  Req,
  UseGuards,
  Query,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmployeeService } from './employee.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('employee')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('settings')
  async getSettings(@Req() req) {
    const userId = req.user?.sub || req.user?.id;
    return await this.employeeService.getSettings(userId);
  }

  @Get('dashboard')
  async getDashboard(@Req() req, @Query('date') date?: string) {
    const userId = req.user?.sub || req.user?.id;
    return this.employeeService.getDashboardData(userId, date);
  }

  @Get('assignments')
  async getAllAssignments(@Req() req) {
    const userId = req.user?.sub || req.user?.id;
    return this.employeeService.getAllAssignments(userId);
  }

  @Post('tasks/:id/clock-in')
  async clockInToTask(@Req() req, @Param('id') taskId: string) {
    const userId = req.user?.sub || req.user?.id;
    return this.employeeService.clockInToTask(userId, taskId);
  }

  @Post('tasks/:id/clock-out')
  async clockOutFromTask(@Req() req, @Param('id') taskId: string) {
    const userId = req.user?.sub || req.user?.id;
    return this.employeeService.clockOutFromTask(userId, taskId);
  }

  @Get('attendance-history')
  async getAttendanceHistory(@Req() req) {
    const userId = req.user?.sub || req.user?.id;
    return this.employeeService.getAttendanceHistory(userId);
  }

  @Patch('settings/profile')
  async updateProfile(@Req() req, @Body() body) {
    const userId = req.user?.sub || req.user?.id;
    return this.employeeService.updateProfile(userId, body);
  }

  @Patch('settings/notifications')
  async updateNotifications(@Req() req, @Body() body) {
    const userId = req.user?.sub || req.user?.id;
    return this.employeeService.updateNotifications(userId, body);
  }

  @Patch('settings/theme')
  async updateTheme(@Req() req, @Body() body) {
    const userId = req.user?.sub || req.user?.id;
    return this.employeeService.updateTheme(userId, body);
  }

  @Patch('settings/password')
  async updatePassword(@Req() req, @Body() body) {
    const userId = req.user?.sub || req.user?.id;
    return this.employeeService.updatePassword(userId, body);
  }

  @Post('upload-profile-picture')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/profile-pictures',
      filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`);
      },
    }),
  }))
  async uploadProfilePicture(@UploadedFile() file, @Req() req) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    await this.employeeService.saveProfilePicture(userId, `/uploads/profile-pictures/${file.filename}`);
    return { url: `/uploads/profile-pictures/${file.filename}` };
  }

  @Post('upload-cv')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/cvs',
      filename: (req, file, cb) => {
        const userId = (req.user as any)?.id;
        if (!userId) return cb(new Error('User not authenticated'), '');
        cb(null, `${userId}-cv${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      cb(null, file.mimetype === 'application/pdf');
    },
  }))
  async uploadCV(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const userId = (req.user as any)?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    await this.employeeService.saveCV(userId, `/uploads/cvs/${file.filename}`);
    return { url: `/uploads/cvs/${file.filename}` };
  }

  @Get('payment-settings')
  async getPaymentSettings() {
    return await this.employeeService.getPaymentSettings();
  }
}
import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMyProfile(@Req() req) {
    return this.userService.getMyProfile(req.user.id);
  }

  @Put('update-profile')
  updateProfile(@Req() req, @Body() dto: any) {
    return this.userService.updateProfile(req.user.id, dto);
  }
}

import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // SIGN UP
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  // LOGIN
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // SEND VERIFICATION CODE TO EMAIL
  @Post('send-verification')
  sendVerificationCode(@Body('email') email: string) {
    return this.authService.sendVerificationCode(email);
  }

  // VERIFY EMAIL
  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  // FORGOT PASSWORD - SEND RESET LINK
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  // RESET PASSWORD USING CODE
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // REFRESH ACCESS TOKEN
  @Post('refresh')
  refreshAccessToken(@Body('userId') userId: string, @Body('refreshToken') token: string) {
    return this.authService.refreshTokens(userId, token);
  }

  // VALIDATE ACCESS TOKEN
  @Post('validate-token')
  validateToken(@Body('token') token: string) {
    return this.authService.validateToken(token);
  }

  // LOGOUT
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logout(@Req() req) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new Error('Missing userId in logout');
    return this.authService.logout(userId);
  }
}

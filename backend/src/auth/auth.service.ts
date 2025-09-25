import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailer: MailerService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const adminExists = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (adminExists) {
      throw new BadRequestException(
        'Admin signup is disabled (admin already exists)',
      );
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: 'ADMIN',
        emailVerified: false,
      },
    });

    // Send email verification code immediately
    await this.sendVerificationCode(user.email);

    return {
      message: 'Admin registered successfully. Verification code sent.',
      role: user.role,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    // Set user online on login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { status: 'online' },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
    });

    const refresh_token = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
    });

    const hashedRefresh = await bcrypt.hash(refresh_token, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefresh },
    });

    return {
      message: 'Login successful',
      access_token,
      refresh_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: 'online', // Optionally return status
      },
    };
  }

  async logout(userId: string) {
    if (!userId) throw new Error('Missing userId in logout');
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null, status: 'offline' }, // Set user offline on logout
    });

    return { message: 'Logout successful' };
  }

  async refreshTokens(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const isMatch = await bcrypt.compare(token, user.refreshToken);
    if (!isMatch) throw new ForbiddenException('Invalid refresh token');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
    });

    const newRefresh = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
    });

    const hashed = await bcrypt.hash(newRefresh, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashed },
    });

    return {
      access_token,
      refresh_token: newRefresh,
    };
  }

  async validateToken(token: string) {
    try {
      const decoded = await this.jwt.verifyAsync(token);
      return decoded;
    } catch {
      throw new UnauthorizedException('Token is invalid or expired');
    }
  }

  async sendVerificationCode(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');

    const code = randomInt(100000, 999999).toString();

    await this.prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        type: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Send email
    await this.mailer.sendMail(
      user.email,
      'Your KNK Verification Code',
      `
        <h2>Hello ${user.name},</h2>
        <p>Your email verification code is:</p>
        <h1 style="color: #39092c;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
      `
    );

    return {
      message: 'Verification code sent to email',
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new BadRequestException('User not found');

    const record = await this.prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code: dto.code,
        type: 'EMAIL_VERIFICATION',
        expiresAt: { gte: new Date() },
      },
    });

    if (!record) throw new BadRequestException('Invalid or expired code');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    await this.prisma.verificationCode.delete({ where: { id: record.id } });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new BadRequestException('Email not found');
    if (!user.emailVerified) throw new BadRequestException('Email not verified');

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 1000 * 60 * 10),
        type: 'PASSWORD_RESET',
      },
    });

    await this.mailer.sendMail(
      user.email,
      'KNK Password Reset Code',
      `
        <h2>Hello ${user.name},</h2>
        <p>Your password reset code is:</p>
        <h1 style="color: #39092c;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
      `
    );

    return {
      message: 'Reset code sent to email',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const codeEntry = await this.prisma.verificationCode.findFirst({
      where: {
        code: dto.code,
        user: {
          email: dto.email,
        },
      },
      include: {
        user: true,
      },
    });

    if (!codeEntry) throw new BadRequestException('Invalid or expired code');
    if (codeEntry.expiresAt < new Date()) throw new BadRequestException('Code expired');

    const hashed = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id: codeEntry.userId },
      data: { password: hashed },
    });

    await this.prisma.verificationCode.delete({
      where: { id: codeEntry.id },
    });

    return { message: 'Password reset successful' };
  }
}

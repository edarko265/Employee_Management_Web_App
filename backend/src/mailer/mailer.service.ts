// src/mailer/mailer.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: +(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendMail(to: string, subject: string, html: string) {
    return await this.transporter.sendMail({
      from: `"KNK Palvelut" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  }
}

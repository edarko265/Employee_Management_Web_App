import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailerModule } from '../mailer/mailer.module';


@Module({
  imports: [PrismaModule, MailerModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

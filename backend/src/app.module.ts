import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { LocationModule } from './location/location.module';
import { SupervisorModule } from './supervisor/supervisor.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // allows env access in all modules
    }),
    PrismaModule,
    AuthModule,
    MailerModule,
    UserModule,
    AdminModule,
    SupervisorModule,
    EmployeeModule,
    LocationModule, // Ensure LocationModule is imported here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

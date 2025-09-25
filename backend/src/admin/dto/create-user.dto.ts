// src/admin/dto/create-admin.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  locationId: string; // <- updated

  @IsOptional()
  supervisorId?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  role?: 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE';
}


import { IsEmail, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @Length(8)
  @IsString()
  password: string;

  @Length(6)
  code: string;
}


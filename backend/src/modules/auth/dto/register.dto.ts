import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

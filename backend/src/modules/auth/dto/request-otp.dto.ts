import { IsMobilePhone, IsString } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @IsMobilePhone('fa-IR')
  mobileNumber!: string;
}

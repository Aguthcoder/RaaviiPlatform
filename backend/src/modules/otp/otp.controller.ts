import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { OtpService } from './otp.service';

@Controller('otp')
@UseGuards(JwtAuthGuard)
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Get('logs')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  logs(@Query('mobileNumber') mobileNumber: string) {
    return this.otpService.getRecentByMobile(mobileNumber);
  }
}

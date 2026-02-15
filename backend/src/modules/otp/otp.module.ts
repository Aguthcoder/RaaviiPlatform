import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpCodeEntity } from '../../database/entities/otp-code.entity';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([OtpCodeEntity])],
  providers: [OtpService, JwtAuthGuard],
  controllers: [OtpController],
})
export class OtpModule {}

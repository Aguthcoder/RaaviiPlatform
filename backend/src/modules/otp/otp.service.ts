import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpCodeEntity } from '../../database/entities/otp-code.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OtpCodeEntity)
    private readonly otpRepository: Repository<OtpCodeEntity>,
  ) {}

  getRecentByMobile(mobileNumber: string) {
    return this.otpRepository.find({ where: { mobileNumber }, order: { createdAt: 'DESC' }, take: 10 });
  }
}

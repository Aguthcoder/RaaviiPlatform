import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { OtpCodeEntity } from '../../database/entities/otp-code.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(OtpCodeEntity)
    private readonly otpRepository: Repository<OtpCodeEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(payload: RegisterDto) {
    const exists = await this.userRepository.findOne({ where: { email: payload.email.toLowerCase() } });
    if (exists) throw new BadRequestException('Email already in use');

    const rounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    const passwordHash = await bcrypt.hash(payload.password, rounds);

    const user = await this.userRepository.save(
      this.userRepository.create({
        email: payload.email.toLowerCase(),
        mobileNumber: payload.mobileNumber,
        passwordHash,
        subscriptionPlan: 'free',
      }),
    );

    return this.issueTokens(user.id, user.mobileNumber || '', user.email || undefined);
  }

  async login(payload: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: payload.email.toLowerCase() } });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const validPassword = await bcrypt.compare(payload.password, user.passwordHash);
    if (!validPassword) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id, user.mobileNumber || '', user.email || undefined);
  }

  async requestOtp(mobileNumber: string) {
    const normalizedMobile = this.normalizeIranianMobile(mobileNumber);
    const rateSeconds = this.configService.get<number>('OTP_RATE_LIMIT_SECONDS', 60);

    const recentOtp = await this.otpRepository.findOne({
      where: { mobileNumber: normalizedMobile, createdAt: MoreThan(new Date(Date.now() - rateSeconds * 1000)) },
      order: { createdAt: 'DESC' },
    });

    if (recentOtp) throw new BadRequestException('Please wait before requesting another OTP');

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresSeconds = this.configService.get<number>('OTP_EXPIRES_SECONDS', 120);

    await this.otpRepository.save(
      this.otpRepository.create({
        mobileNumber: normalizedMobile,
        otpHash: this.hashOtp(normalizedMobile, otp),
        expiresAt: new Date(Date.now() + expiresSeconds * 1000),
      }),
    );

    return { message: 'OTP sent successfully', expiresInSeconds: expiresSeconds, otpForDev: otp };
  }

  async verifyOtp(mobileNumber: string, otp: string) {
    const normalizedMobile = this.normalizeIranianMobile(mobileNumber);
    const otpEntry = await this.otpRepository.findOne({
      where: { mobileNumber: normalizedMobile, consumedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    if (!otpEntry || otpEntry.expiresAt.getTime() < Date.now()) throw new UnauthorizedException('Invalid OTP');
    otpEntry.attempts += 1;
    if (otpEntry.attempts > 5) {
      await this.otpRepository.save(otpEntry);
      throw new UnauthorizedException('OTP attempt limit exceeded');
    }

    const otpIsValid = otpEntry.otpHash === this.hashOtp(normalizedMobile, otp);
    if (!otpIsValid) {
      await this.otpRepository.save(otpEntry);
      throw new UnauthorizedException('Invalid OTP');
    }

    otpEntry.consumedAt = new Date();
    await this.otpRepository.save(otpEntry);

    let user = await this.userRepository.findOne({ where: { mobileNumber: normalizedMobile } });
    if (!user) {
      user = await this.userRepository.save(this.userRepository.create({ mobileNumber: normalizedMobile }));
    }

    return this.issueTokens(user.id, normalizedMobile, user.email || undefined);
  }

  refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          this.configService.getOrThrow<string>('JWT_SECRET'),
      });
      return this.issueTokens(payload.sub, payload.mobileNumber, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private issueTokens(sub: string, mobileNumber: string, email?: string) {
    const payload = { sub, mobileNumber, email };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret:
          this.configService.get<string>('JWT_SECRET') ??
          this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRES'),
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'),
      }),
    };
  }

  private hashOtp(mobileNumber: string, otp: string) {
    return crypto
      .createHmac('sha256', this.configService.getOrThrow<string>('OTP_SECRET'))
      .update(`${mobileNumber}:${otp}`)
      .digest('hex');
  }

  private normalizeIranianMobile(input: string) {
    const digits = input.replace(/\D/g, '');
    if (digits.startsWith('09') && digits.length === 11) return `+98${digits.slice(1)}`;
    if (digits.startsWith('989') && digits.length === 12) return `+${digits}`;
    if (digits.startsWith('9') && digits.length === 10) return `+98${digits}`;
    throw new BadRequestException('Invalid mobile number');
  }
}

import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(@Body() body: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.register(body);
    this.setAuthCookies(res, data.accessToken, data.refreshToken);
    return { message: 'Registered successfully' };
  }

  @Post('login')
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.login(body);
    this.setAuthCookies(res, data.accessToken, data.refreshToken);
    return { message: 'Login successful' };
  }

  @Post('request-otp')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  requestOtp(@Body() body: RequestOtpDto) {
    return this.authService.requestOtp(body.mobileNumber);
  }

  @Post('verify-otp')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async verifyOtp(@Body() body: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.verifyOtp(body.mobileNumber, body.otp);
    this.setAuthCookies(res, data.accessToken, data.refreshToken);
    return { message: 'OTP verification successful' };
  }

  @Post('refresh')
  async refresh(@Req() req: { headers: Record<string, string | undefined> }, @Res({ passthrough: true }) res: Response) {
    const cookieHeader = req.headers.cookie ?? '';
    const refreshToken = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('refreshToken='))
      ?.split('=')[1];

    const data = this.authService.refreshToken(refreshToken || '');
    this.setAuthCookies(res, data.accessToken, data.refreshToken);
    return { message: 'Token refreshed' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return { message: 'Logged out' };
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
}

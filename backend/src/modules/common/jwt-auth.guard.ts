import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from './roles';

type RequestWithUser = {
  headers: Record<string, string | undefined>;
  user?: {
    sub: string;
    mobileNumber?: string;
    email?: string;
    role: UserRole;
  };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    const cookieHeader = req.headers.cookie ?? '';

    const cookieToken = cookieHeader
      .split(';')
      .map((p) => p.trim())
      .find((p) => p.startsWith('accessToken='))
      ?.split('=')[1];

    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const token = bearerToken ?? cookieToken;

    if (!token) throw new UnauthorizedException('Missing access token');

    try {
      req.user = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET ?? process.env.JWT_ACCESS_SECRET ?? 'dev_secret',
      }) as RequestWithUser['user'];

      return true;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}

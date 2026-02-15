import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

type RequestWithUser = {
  headers: Record<string, string | undefined>;
  user?: any;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    const cookieHeader = req.headers.cookie ?? "";

    const token = cookieHeader
      .split(";")
      .map((p) => p.trim())
      .find((p) => p.startsWith("accessToken="))
      ?.split("=")[1];

    if (!token) throw new UnauthorizedException("Missing access token");

    try {
      req.user = this.jwtService.verify(token, {
        secret:
          process.env.JWT_SECRET ??
          process.env.JWT_ACCESS_SECRET ??
          "dev_secret",
      });

      return true;
    } catch {
      throw new UnauthorizedException("Invalid access token");
    }
  }
}

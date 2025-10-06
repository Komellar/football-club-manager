import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@repo/core';
import type { RequestWithUser } from '@/modules/auth/types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const token = this.extractTokenFromRequest(request);
    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<User>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      request.user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromRequest(
    request: RequestWithUser,
  ): string | undefined {
    // Try to get token from Authorization header first (for SSR)
    const authHeader = request.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Fall back to cookie (for CSR)
    return this.extractTokenFromCookie(request);
  }

  private extractTokenFromCookie(request: RequestWithUser): string | undefined {
    const cookies = request.cookies as Record<string, string> | undefined;
    return cookies?.auth_token;
  }
}

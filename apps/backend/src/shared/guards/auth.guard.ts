import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthTokenPayloadSchema } from '@repo/core';
import type { RequestWithUser } from '@/modules/auth/types';
import { IS_PUBLIC_KEY } from '@/shared/decorators/public.decorator';

/**
 * Registered globally (APP_GUARD). Every HTTP route requires a valid token
 * unless it is marked with @Public(). WebSocket gateways authenticate
 * their own messages.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const token = this.extractTokenFromRequest(request);
    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const payload: unknown = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      request.user = AuthTokenPayloadSchema.parse(payload);
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

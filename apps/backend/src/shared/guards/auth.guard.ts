import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { RequestWithUser } from '@/modules/auth/types';
import { AuthService } from '@/modules/auth/services/auth.service';
import { IS_PUBLIC_KEY } from '@/shared/decorators/public.decorator';
import { extractSessionToken } from './session-token';

/**
 * Registered globally (APP_GUARD). Every HTTP route requires a valid,
 * unrevoked session unless it is marked with @Public(). WebSocket gateways
 * authenticate their own messages.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
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

    const token = extractSessionToken(request);
    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    request.user = (await this.authService.verifySession(token)).user;
    return true;
  }
}

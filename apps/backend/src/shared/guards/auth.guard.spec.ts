import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '@repo/core';
import { AuthGuard } from './auth.guard';
import type { AuthService } from '@/modules/auth/services/auth.service';
import type { RequestWithUser } from '@/modules/auth/types';

describe('AuthGuard', () => {
  const user = {
    userId: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: RoleType.USER,
  };
  const auth = { verifySession: jest.fn() };
  const guard = new AuthGuard(auth as unknown as AuthService, new Reflector());
  const handler = () => undefined;
  class Controller {}
  let request: Partial<RequestWithUser>;

  const context = (type = 'http') =>
    ({
      getType: () => type,
      getHandler: () => handler,
      getClass: () => Controller,
      switchToHttp: () => ({ getRequest: () => request }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    request = { headers: {} };
    auth.verifySession.mockResolvedValue({ user, expiresAt: new Date() });
  });

  it('requires a token', async () => {
    await expect(guard.canActivate(context())).rejects.toThrow(
      'Access token is required',
    );
  });

  it('ignores malformed or lowercase bearer headers', async () => {
    for (const authorization of ['InvalidToken', 'bearer lowercase-token']) {
      request.headers = { authorization };
      await expect(guard.canActivate(context())).rejects.toThrow(
        UnauthorizedException,
      );
    }
    expect(auth.verifySession).not.toHaveBeenCalled();
  });

  it('accepts the bearer header and attaches the current user', async () => {
    request.headers = { authorization: 'Bearer valid-token' };
    await expect(guard.canActivate(context())).resolves.toBe(true);
    expect(auth.verifySession).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual(user);
  });

  it('falls back to the auth_token cookie', async () => {
    request.cookies = { auth_token: 'cookie-token' };
    await guard.canActivate(context());
    expect(auth.verifySession).toHaveBeenCalledWith('cookie-token');
  });

  it('rejects revoked or invalid sessions', async () => {
    request.headers = { authorization: 'Bearer revoked' };
    auth.verifySession.mockRejectedValue(
      new UnauthorizedException('Session has been revoked'),
    );
    await expect(guard.canActivate(context())).rejects.toThrow(
      'Session has been revoked',
    );
  });

  it('lets @Public() routes through without a token', async () => {
    Reflect.defineMetadata('isPublic', true, handler);
    try {
      await expect(guard.canActivate(context())).resolves.toBe(true);
      expect(auth.verifySession).not.toHaveBeenCalled();
    } finally {
      Reflect.deleteMetadata('isPublic', handler);
    }
  });

  it('leaves WebSocket contexts to the gateway', async () => {
    await expect(guard.canActivate(context('ws'))).resolves.toBe(true);
  });
});

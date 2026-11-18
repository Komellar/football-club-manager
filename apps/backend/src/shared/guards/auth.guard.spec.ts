import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { RoleType, User } from '@repo/core';
import type { RequestWithUser } from '@/modules/auth/types';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let configService: ConfigService;
  let verifyAsyncSpy: jest.SpyInstance;
  let getSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        Reflector,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    verifyAsyncSpy = jest.spyOn(jwtService, 'verifyAsync');
    getSpy = jest.spyOn(configService, 'get');
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;
    let mockRequest: Partial<RequestWithUser>;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };

      mockExecutionContext = {
        getType: () => 'http',
        getHandler: () => handler,
        getClass: () => Controller,
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;
    });

    const handler = () => undefined;
    class Controller {}

    it('lets @Public() routes through without a token', async () => {
      Reflect.defineMetadata('isPublic', true, handler);
      try {
        await expect(guard.canActivate(mockExecutionContext)).resolves.toBe(
          true,
        );
        expect(verifyAsyncSpy).not.toHaveBeenCalled();
      } finally {
        Reflect.deleteMetadata('isPublic', handler);
      }
    });

    it('leaves WebSocket contexts to the gateway', async () => {
      const wsContext = {
        ...mockExecutionContext,
        getType: () => 'ws',
      } as unknown as ExecutionContext;
      await expect(guard.canActivate(wsContext)).resolves.toBe(true);
    });

    it('should throw UnauthorizedException when no authorization header is present', async () => {
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Access token is required',
      );
    });

    it('should throw UnauthorizedException when authorization header is malformed', async () => {
      mockRequest.headers = { authorization: 'InvalidToken' };

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Invalid or expired token',
      );
    });

    it('should return true and attach user to request when token is valid', async () => {
      const mockPayload: User = {
        userId: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: RoleType.USER,
      };

      mockRequest.headers = { authorization: 'Bearer valid-token' };
      verifyAsyncSpy.mockResolvedValue(mockPayload);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual(mockPayload);
      expect(verifyAsyncSpy).toHaveBeenCalledWith('valid-token', {
        secret: 'test-secret',
      });
    });

    it('should call configService.get with JWT_SECRET', async () => {
      const mockPayload: User = {
        userId: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: RoleType.USER,
      };

      mockRequest.headers = { authorization: 'Bearer valid-token' };
      verifyAsyncSpy.mockResolvedValue(mockPayload);

      await guard.canActivate(mockExecutionContext);

      expect(getSpy).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('should handle Bearer token with different casing', async () => {
      mockRequest.headers = { authorization: 'bearer lowercase-token' };

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('normalizes existing JWTs signed with id to the profile contract', async () => {
      mockRequest.headers = { authorization: 'Bearer existing-token' };
      verifyAsyncSpy.mockResolvedValue({
        id: 5,
        name: 'Existing User',
        email: 'existing@example.com',
        role: RoleType.USER,
      });
      await guard.canActivate(mockExecutionContext);
      expect(mockRequest.user?.userId).toBe(5);
    });

    it('rejects signed payloads without a valid user identity', async () => {
      mockRequest.headers = { authorization: 'Bearer malformed-token' };
      verifyAsyncSpy.mockResolvedValue({ role: RoleType.ADMIN });
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

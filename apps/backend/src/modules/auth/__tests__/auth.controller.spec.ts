import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { throttlerOptions } from '../../../config/throttle.config';
import { Response as ExpressResponse } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '@/shared/guards/auth.guard';
import type { LoginDto, CreateUserDto, LoginResponseDto } from '@repo/core';
import { RoleType } from '@repo/core';
import type { RequestWithUser } from '../types';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: {
    register: jest.Mock;
    login: jest.Mock;
    validateUser: jest.Mock;
    revokeSessions: jest.Mock;
  };

  const mockLoginDto: LoginDto = {
    email: 'john@example.com',
    password: 'password123',
  };

  const mockRegisterDto: CreateUserDto = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    roleName: RoleType.USER,
  };

  const expiresAt = new Date('2030-01-01T00:00:00Z');
  const mockAuthBody: LoginResponseDto = {
    user: {
      id: 1,
      email: 'john@example.com',
      name: 'John Doe',
      role: RoleType.USER,
    },
  };
  const mockAuthResult = {
    token: 'mock-jwt-token',
    expiresAt,
    body: mockAuthBody,
  };

  let mockResponse: Partial<ExpressResponse>;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      validateUser: jest.fn(),
      revokeSessions: jest.fn(),
    };

    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot(throttlerOptions)],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: AuthGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
            verifyAsync: jest.fn(() => ({
              userId: 1,
              email: 'test@example.com',
            })),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => 'test-secret'),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and set auth cookie', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResult);

      const result = await controller.register(
        mockRegisterDto,
        mockResponse as ExpressResponse,
      );

      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'auth_token',
        'mock-jwt-token',
        {
          httpOnly: true,
          secure: false, // NODE_ENV !== 'production' in test
          sameSite: 'lax',
          expires: expiresAt, // the cookie lives exactly as long as the token
          path: '/',
        },
      );
      expect(result).toEqual(mockAuthBody);
      expect(result).not.toHaveProperty('access_token');
    });

    it('should throw error when registration fails', async () => {
      mockAuthService.register.mockRejectedValue(
        new Error('Email already exists'),
      );

      await expect(
        controller.register(mockRegisterDto, mockResponse as ExpressResponse),
      ).rejects.toThrow('Email already exists');

      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully and set auth cookie', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResult);

      const result = await controller.login(
        mockLoginDto,
        mockResponse as ExpressResponse,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'auth_token',
        'mock-jwt-token',
        {
          httpOnly: true,
          secure: false, // NODE_ENV !== 'production' in test
          sameSite: 'lax',
          expires: expiresAt, // the cookie lives exactly as long as the token
          path: '/',
        },
      );
      expect(result).toEqual(mockAuthBody);
      expect(result).not.toHaveProperty('access_token');
    });

    it('should throw UnauthorizedException when login fails', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(
        controller.login(mockLoginDto, mockResponse as ExpressResponse),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('revokes the sessions, clears the cookie and returns success', async () => {
      const req = { headers: {}, cookies: { auth_token: 'current-token' } };
      const result = await controller.logout(
        req as unknown as Parameters<AuthController['logout']>[0],
        mockResponse as ExpressResponse,
      );

      expect(mockAuthService.revokeSessions).toHaveBeenCalledWith(
        'current-token',
      );
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('auth_token', {
        httpOnly: true,
        secure: false, // NODE_ENV !== 'production' in test
        sameSite: 'lax',
        path: '/',
      });
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('profile', () => {
    it('should return user profile from JWT payload', () => {
      const mockRequest = {
        user: {
          userId: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: RoleType.USER,
        },
      } as unknown as RequestWithUser;

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual({
        userId: mockRequest.user.userId,
        name: mockRequest.user.name,
        email: mockRequest.user.email,
        role: mockRequest.user.role,
      });
    });
  });
});

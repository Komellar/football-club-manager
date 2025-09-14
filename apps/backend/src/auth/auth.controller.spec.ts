import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import type { LoginDto, CreateUserDto } from '@repo/core';
import { RoleType } from '@repo/core';
import type { RequestWithUser } from './types';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: {
    register: jest.Mock;
    login: jest.Mock;
    validateUser: jest.Mock;
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

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
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
    it('should register a user and return user data without password', async () => {
      const mockRegisterResult = {
        access_token: 'jwt-token-123',
        user: {
          id: 1,
          email: 'john@example.com',
          name: 'John Doe',
          role: RoleType.USER,
        },
      };

      mockAuthService.register.mockResolvedValue(mockRegisterResult);

      const result: unknown = await controller.register(mockRegisterDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
      expect(result).toEqual(mockRegisterResult);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw error when registration fails', async () => {
      mockAuthService.register.mockRejectedValue(
        new Error('Email already exists'),
      );

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        'Email already exists',
      );

      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterDto);
    });
  });

  describe('login', () => {
    it('should login successfully and return access token with user data', async () => {
      const mockLoginResult = {
        access_token: 'jwt-token-123',
        user: {
          id: 1,
          email: 'john@example.com',
          name: 'John Doe',
          role: RoleType.USER,
        },
      };

      mockAuthService.login.mockResolvedValue(mockLoginResult);

      const result: unknown = await controller.login(mockLoginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
      expect(result).toEqual(mockLoginResult);
    });

    it('should throw UnauthorizedException when login fails', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
    });
  });

  describe('profile', () => {
    it('should return user profile from JWT payload', () => {
      const mockRequest = {
        user: {
          userId: 1,
          email: 'john@example.com',
          role: RoleType.USER,
        },
      } as unknown as RequestWithUser;

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual({
        id: 1,
        email: 'john@example.com',
        role: RoleType.USER,
      });
    });
  });
});

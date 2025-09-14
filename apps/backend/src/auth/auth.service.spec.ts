import { AuthService } from './auth.service';
import type { CreateUserDto } from '@repo/core';
import { RoleType } from '@repo/core';
import type { UserService } from '../user/user.service';
import type { JwtService } from '@nestjs/jwt';
import type { User } from '../database/entities/user.entity';
import type { Role } from '../database/entities/role.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService: jest.Mocked<Pick<UserService, 'create' | 'findByEmail'>>;
  let mockJwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  const mockRegisterDto: CreateUserDto = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    roleName: RoleType.USER,
  };

  const mockRole: Role = {
    id: 1,
    name: RoleType.USER,
    users: [], // Empty array to satisfy the relation
  };

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: 'hashedpassword123',
    role: mockRole,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockUserResponse = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: {
      id: 1,
      name: RoleType.USER,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    mockUserService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    // Use type assertion with unknown as intermediate step for cleaner type casting
    service = new AuthService(
      mockUserService as unknown as UserService,
      mockJwtService as unknown as JwtService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      mockUserService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token-123');

      const result = await service.register(mockRegisterDto);

      expect(mockUserService.create).toHaveBeenCalledWith(mockRegisterDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'john@example.com',
        sub: 1,
        role: RoleType.USER,
      });
      expect(result).toEqual({
        access_token: 'jwt-token-123',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: RoleType.USER,
        },
      });
    });

    it('should throw error when user creation fails', async () => {
      mockUserService.create.mockRejectedValue(new Error('Role not found'));

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        'Role not found',
      );

      expect(mockUserService.create).toHaveBeenCalledWith(mockRegisterDto);
    });
  });

  describe('login', () => {
    it('should login successfully and return access token with user data', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('jwt-token-123');

      const result = await service.login('john@example.com', 'password123');

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedpassword123',
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'john@example.com',
        sub: 1,
        role: RoleType.USER,
      });
      expect(result).toEqual({
        access_token: 'jwt-token-123',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: RoleType.USER,
        },
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        service.login('john@example.com', 'wrongpassword'),
      ).rejects.toThrow('Invalid credentials');

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        'hashedpassword123',
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('notfound@example.com', 'password123'),
      ).rejects.toThrow('Invalid credentials');

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'notfound@example.com',
      );
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser(
        'john@example.com',
        'password123',
      );

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedpassword123',
      );
      expect(result).toEqual(mockUserResponse);
    });

    it('should return null when user is not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'john@example.com',
        'password123',
      );

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
      );
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser(
        'john@example.com',
        'wrongpassword',
      );

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        'hashedpassword123',
      );
      expect(result).toBeNull();
    });
  });
});

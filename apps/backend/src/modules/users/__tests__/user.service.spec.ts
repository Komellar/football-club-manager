import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '../services/user.service';
import { User } from '@/shared/entities/user.entity';
import { Role } from '@/shared/entities/role.entity';
import { RoleType } from '@repo/core';
import type { CreateUserDto } from '@repo/core';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };
  let mockRoleRepository: {
    findOne: jest.Mock;
  };

  const mockRole: Role = {
    id: 1,
    name: RoleType.USER,
    users: [],
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

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    mockRoleRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      roleName: RoleType.USER,
    };

    it('should create a user successfully', async () => {
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockBcrypt.hash.mockResolvedValue('hashedpassword123' as never);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { name: RoleType.USER },
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedpassword123',
        role: mockRole,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw error when role is not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Role not found',
      );

      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { name: RoleType.USER },
      });
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should handle bcrypt hash error', async () => {
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockBcrypt.hash.mockRejectedValue(new Error('Hash error') as never);

      await expect(service.create(createUserDto)).rejects.toThrow('Hash error');

      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { name: RoleType.USER },
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository save error', async () => {
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockBcrypt.hash.mockResolvedValue('hashedpassword123' as never);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Database error',
      );

      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { name: RoleType.USER },
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashedpassword123',
        role: mockRole,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        relations: ['role'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
        relations: ['role'],
      });
      expect(result).toBeNull();
    });

    it('should handle repository error', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findByEmail('john@example.com')).rejects.toThrow(
        'Database error',
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        relations: ['role'],
      });
    });
  });

  describe('findById', () => {
    it('should find user by id successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['role'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['role'],
      });
      expect(result).toBeNull();
    });

    it('should handle repository error', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findById(1)).rejects.toThrow('Database error');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['role'],
      });
    });
  });
});

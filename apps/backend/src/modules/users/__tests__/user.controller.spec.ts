import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { User } from '@/shared/entities/user.entity';
import { RoleType } from '@repo/core';
import type { CreateUserDto } from '@repo/core';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: 'hashedpassword123',
    role: RoleType.USER,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const expectedUserResponse = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: RoleType.USER,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and return user data without password', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        roleName: RoleType.USER,
      };

      jest.spyOn(userService, 'create').mockResolvedValue(mockUser);

      const result: unknown = await controller.create(createUserDto);

      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUserResponse);
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('findById', () => {
    it('should return user data without password when user exists', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);

      const result: unknown = await controller.findById(1);

      expect(mockUserService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedUserResponse);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(controller.findById(999)).rejects.toThrow(NotFoundException);
      await expect(controller.findById(999)).rejects.toThrow('User not found');

      expect(mockUserService.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findByEmail', () => {
    it('should return user data without password when user exists', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      const result: unknown = await controller.findByEmail('john@example.com');

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
      );
      expect(result).toEqual(expectedUserResponse);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        controller.findByEmail('nonexistent@example.com'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.findByEmail('nonexistent@example.com'),
      ).rejects.toThrow('User not found');

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
    });
  });
});

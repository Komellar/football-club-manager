import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { User } from '@/shared/entities/user.entity';
import { RoleType } from '@repo/core';
import type { RequestWithUser } from '@/modules/auth/types';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    findById: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: 'hashedpassword123',
    role: RoleType.USER,
    tokenVersion: 0,
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

  const requestFor = (userId: number, role = RoleType.USER) =>
    ({
      user: { userId, name: 'Caller', email: 'caller@example.com', role },
    }) as RequestWithUser;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('does not expose anonymous account creation or email lookup', () => {
    expect(controller).not.toHaveProperty('create');
    expect(controller).not.toHaveProperty('findByEmail');
  });

  describe('findById', () => {
    it('returns your own account without the password hash', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);

      const result: unknown = await controller.findById(1, requestFor(1));

      expect(mockUserService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedUserResponse);
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('tokenVersion');
    });

    it("refuses to return another user's account", async () => {
      await expect(controller.findById(2, requestFor(1))).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockUserService.findById).not.toHaveBeenCalled();
    });

    it('lets an admin read any account', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);

      await expect(
        controller.findById(1, requestFor(9, RoleType.ADMIN)),
      ).resolves.toEqual(expectedUserResponse);
    });

    it('throws NotFoundException when the account does not exist', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(
        controller.findById(999, requestFor(9, RoleType.ADMIN)),
      ).rejects.toThrow('User not found');
      await expect(
        controller.findById(999, requestFor(9, RoleType.ADMIN)),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

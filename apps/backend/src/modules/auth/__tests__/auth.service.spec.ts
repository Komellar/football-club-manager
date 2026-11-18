import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import type { CreateUserDto } from '@repo/core';
import { RoleType, CreateUserApiSchema } from '@repo/core';
import { AuthService, SESSIONS_REVOKED_EVENT } from '../services/auth.service';
import type { UserService } from '@/modules/users/services/user.service';
import type { User } from '@/shared/entities/user.entity';

jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let jwt: JwtService;
  let user: User;
  let userService: {
    create: jest.Mock;
    findByEmail: jest.Mock;
    findById: jest.Mock;
    incrementTokenVersion: jest.Mock;
  };
  const events = { emit: jest.fn() };

  const registerDto: CreateUserDto = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123',
    roleName: RoleType.USER,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashedpassword123',
      role: RoleType.USER,
      tokenVersion: 0,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
    userService = {
      create: jest.fn().mockResolvedValue(user),
      findByEmail: jest.fn().mockResolvedValue(user),
      findById: jest.fn(() => Promise.resolve(user)),
      incrementTokenVersion: jest.fn(() => {
        user.tokenVersion++;
        return Promise.resolve();
      }),
    };
    jwt = new JwtService({
      secret: 'test-secret',
      signOptions: { expiresIn: '1d' },
    });
    service = new AuthService(
      userService as unknown as UserService,
      jwt,
      events as unknown as EventEmitter2,
    );
  });

  describe('register', () => {
    it('forces a regular role even when an admin role is supplied', async () => {
      await service.register({ ...registerDto, roleName: RoleType.ADMIN });
      expect(userService.create).toHaveBeenCalledWith({
        ...registerDto,
        roleName: RoleType.USER,
      });
      expect(
        CreateUserApiSchema.parse({ ...registerDto, roleName: RoleType.ADMIN })
          .roleName,
      ).toBe(RoleType.USER);
    });

    it('returns the profile without the token, and a token that expires in a day', async () => {
      const session = await service.register(registerDto);

      expect(session.body).toEqual({
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: RoleType.USER,
        },
      });
      expect(JSON.stringify(session.body)).not.toContain(session.token);
      expect(jwt.decode(session.token)).toMatchObject({ userId: 1, tv: 0 });
      const lifetime = session.expiresAt.getTime() - Date.now();
      expect(lifetime).toBeGreaterThan(23 * 3600_000);
      expect(lifetime).toBeLessThanOrEqual(24 * 3600_000);
    });
  });

  describe('login', () => {
    it('issues a session for valid credentials', async () => {
      mockBcrypt.compare.mockResolvedValue(true as never);

      const session = await service.login('john@example.com', 'Password123');

      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'Password123',
        'hashedpassword123',
      );
      await expect(service.verifySession(session.token)).resolves.toMatchObject(
        { user: { userId: 1, role: RoleType.USER } },
      );
    });

    it('rejects a wrong password', async () => {
      mockBcrypt.compare.mockResolvedValue(false as never);
      await expect(
        service.login('john@example.com', 'wrongpassword'),
      ).rejects.toThrow('Invalid credentials');
    });

    it('still runs a password comparison for unknown emails', async () => {
      userService.findByEmail.mockResolvedValue(null);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        service.login('notfound@example.com', 'Password123'),
      ).rejects.toThrow('Invalid credentials');
      // Timing therefore does not reveal which emails are registered.
      expect(mockBcrypt.compare).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifySession', () => {
    const issue = () => service.register(registerDto).then((s) => s.token);

    it('reads the profile from the database, so role changes apply at once', async () => {
      const token = await issue();
      user.role = RoleType.ADMIN;
      user.name = 'Renamed';

      const { user: current } = await service.verifySession(token);

      expect(current).toEqual({
        userId: 1,
        name: 'Renamed',
        email: 'john@example.com',
        role: RoleType.ADMIN,
      });
    });

    it('rejects tokens that are forged, expired or missing a version', async () => {
      const forged = new JwtService({ secret: 'other' }).sign({
        userId: 1,
        tv: 0,
      });
      const expired = jwt.sign({ userId: 1, tv: 0 }, { expiresIn: -10 });
      // Tokens issued before this change carried profile data and no version.
      const legacy = jwt.sign({ userId: 1, name: 'John', role: 'admin' });

      for (const token of [forged, expired, legacy, 'not-a-jwt']) {
        await expect(service.verifySession(token)).rejects.toThrow(
          UnauthorizedException,
        );
      }
    });

    it('rejects tokens of deleted users', async () => {
      const token = await issue();
      userService.findById.mockResolvedValue(null);
      await expect(service.verifySession(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('revokeSessions', () => {
    it("invalidates every one of the user's tokens and announces it", async () => {
      const first = (await service.register(registerDto)).token;
      const second = (await service.register(registerDto)).token;

      await service.revokeSessions(first);

      expect(userService.incrementTokenVersion).toHaveBeenCalledWith(1);
      expect(events.emit).toHaveBeenCalledWith(SESSIONS_REVOKED_EVENT, 1);
      await expect(service.verifySession(first)).rejects.toThrow(
        'Session has been revoked',
      );
      await expect(service.verifySession(second)).rejects.toThrow(
        'Session has been revoked',
      );
      // Signing in again works.
      const fresh = (await service.register(registerDto)).token;
      await expect(service.verifySession(fresh)).resolves.toBeDefined();
    });

    it('ignores missing, invalid and already revoked tokens', async () => {
      const token = (await service.register(registerDto)).token;
      await service.revokeSessions(token);
      userService.incrementTokenVersion.mockClear();

      await service.revokeSessions(undefined);
      await service.revokeSessions('garbage');
      await service.revokeSessions(token);

      expect(userService.incrementTokenVersion).not.toHaveBeenCalled();
    });
  });
});

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { UserService } from '@/modules/users/services/user.service';
import type { User as UserEntity } from '@/shared/entities/user.entity';
import { AuthTokenPayloadSchema, RoleType } from '@repo/core';
import type { CreateUserDto, LoginResponseDto, User } from '@repo/core';

// Hash of a random value nobody knows, at the same cost as real accounts.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(randomUUID(), 10);

/** Emitted with the user id when a user's sessions are revoked. */
export const SESSIONS_REVOKED_EVENT = 'auth.sessions-revoked';

export interface AuthSession {
  /** Goes only into the httpOnly cookie, never into a response body. */
  token: string;
  expiresAt: Date;
  body: LoginResponseDto;
}

export interface VerifiedSession {
  user: User;
  expiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly events: EventEmitter2,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.userService.findByEmail(email);
    // Always run one bcrypt comparison so response time does not reveal
    // whether the email is registered.
    const passwordMatches = await bcrypt.compare(
      password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );
    return user && passwordMatches ? user : null;
  }

  async login(email: string, password: string): Promise<AuthSession> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.createSession(user);
  }

  async register(userData: CreateUserDto): Promise<AuthSession> {
    const user = await this.userService.create({
      ...userData,
      roleName: RoleType.USER,
    });
    return this.createSession(user);
  }

  /**
   * Verifies the signature and expiry, then checks the token against the
   * user's current token version. The returned profile comes from the
   * database, so a role change applies on the next request.
   */
  async verifySession(token: string): Promise<VerifiedSession> {
    let claims: { userId: number; tv: number; exp?: number };
    try {
      const payload =
        await this.jwtService.verifyAsync<Record<string, unknown>>(token);
      claims = {
        ...AuthTokenPayloadSchema.parse(payload),
        exp: payload.exp as number,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.userService.findById(claims.userId);
    if (!user || user.tokenVersion !== claims.tv) {
      throw new UnauthorizedException('Session has been revoked');
    }

    return {
      user: this.toUser(user),
      expiresAt: new Date((claims.exp ?? 0) * 1000),
    };
  }

  /**
   * Logs the token's owner out everywhere by bumping their token version.
   * An invalid or already revoked token is ignored: logout always succeeds.
   */
  async revokeSessions(token: string | undefined): Promise<void> {
    if (!token) return;
    let userId: number;
    try {
      userId = (await this.verifySession(token)).user.userId;
    } catch {
      return;
    }
    await this.userService.incrementTokenVersion(userId);
    this.events.emit(SESSIONS_REVOKED_EVENT, userId);
  }

  private createSession(user: UserEntity): AuthSession {
    const token = this.jwtService.sign({
      userId: user.id,
      tv: user.tokenVersion ?? 0,
    });
    const { exp } = this.jwtService.decode<{ exp: number }>(token);
    return {
      token,
      expiresAt: new Date(exp * 1000),
      body: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

  private toUser(user: UserEntity): User {
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}

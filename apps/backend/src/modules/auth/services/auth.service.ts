import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/modules/users/services/user.service';
import { RoleType } from '@repo/core';
import type {
  CreateUserDto,
  UserResponseDto,
  LoginResponseDto,
} from '@repo/core';
import * as bcrypt from 'bcrypt';

import { randomUUID } from 'crypto';

// Hash of a random value nobody knows, at the same cost as real accounts.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(randomUUID(), 10);

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  private createAuthResponse(user: UserResponseDto): LoginResponseDto {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
      user: payload,
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponseDto | null> {
    const user = await this.userService.findByEmail(email);
    // Always run one bcrypt comparison so response time does not reveal
    // whether the email is registered.
    const passwordMatches = await bcrypt.compare(
      password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );
    if (user && passwordMatches) {
      // Transform User entity to UserResponseDto format
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }
    return null;
  }

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAuthResponse(user);
  }

  async register(userData: CreateUserDto): Promise<LoginResponseDto> {
    const { passwordHash: _, ...user } = await this.userService.create({
      ...userData,
      roleName: RoleType.USER,
    });

    return this.createAuthResponse(user);
  }
}

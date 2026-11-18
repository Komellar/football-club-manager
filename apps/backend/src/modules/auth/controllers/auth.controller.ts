import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
  Response,
} from '@nestjs/common';
import { ApiTags, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { REGISTER_THROTTLE } from '../../../config/throttle.config';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { AuthService, type AuthSession } from '../services/auth.service';
import {
  AUTH_COOKIE_NAME,
  extractSessionToken,
} from '@/shared/guards/session-token';
import { Public } from '@/shared/decorators/public.decorator';
import { CreateUserApiSchema, LoginSchema } from '@repo/core';
import type {
  CreateUserDto,
  LoginDto,
  User,
  LoginResponseDto,
} from '@repo/core';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import type { RequestWithUser } from '../types';
import {
  LoginUser,
  RegisterUser,
  GetCurrentUser,
} from '../decorators/auth-endpoint.decorators';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginUser()
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<LoginResponseDto> {
    const session = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    return this.startSession(res, session);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle(REGISTER_THROTTLE)
  @ApiTooManyRequestsResponse({ description: 'Too many sign-ups' })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RegisterUser()
  async register(
    @Body(new ZodValidationPipe(CreateUserApiSchema))
    registerDto: CreateUserDto,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<LoginResponseDto> {
    const session = await this.authService.register(registerDto);
    return this.startSession(res, session);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req: ExpressRequest,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<{ message: string }> {
    // Revokes every session of this user, not just this browser's cookie.
    await this.authService.revokeSessions(extractSessionToken(req));
    res.clearCookie(AUTH_COOKIE_NAME, this.cookieOptions());

    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @GetCurrentUser()
  getProfile(@Request() req: RequestWithUser): User {
    return {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    };
  }

  /** The cookie expires with the token, and the token stays out of the body. */
  private startSession(
    res: ExpressResponse,
    session: AuthSession,
  ): LoginResponseDto {
    res.cookie(AUTH_COOKIE_NAME, session.token, {
      ...this.cookieOptions(),
      expires: session.expiresAt,
    });
    return session.body;
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
  }
}

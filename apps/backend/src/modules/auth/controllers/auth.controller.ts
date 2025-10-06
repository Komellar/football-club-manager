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
import { ApiTags } from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '@/shared/guards/auth.guard';
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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginUser()
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<LoginResponseDto> {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    this.setAuthCookie(res, result.access_token);
    return result;
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RegisterUser()
  async register(
    @Body(new ZodValidationPipe(CreateUserApiSchema))
    registerDto: CreateUserDto,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<LoginResponseDto> {
    const result = await this.authService.register(registerDto);
    this.setAuthCookie(res, result.access_token);
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Response({ passthrough: true }) res: ExpressResponse): {
    message: string;
  } {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @GetCurrentUser()
  getProfile(@Request() req: RequestWithUser): User {
    return {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    };
  }

  private setAuthCookie(res: ExpressResponse, token: string) {
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      path: '/',
    });
  }
}

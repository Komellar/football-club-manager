import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  ): Promise<LoginResponseDto> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RegisterUser()
  async register(
    @Body(new ZodValidationPipe(CreateUserApiSchema))
    registerDto: CreateUserDto,
  ): Promise<LoginResponseDto> {
    return this.authService.register(registerDto);
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
}

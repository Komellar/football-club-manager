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
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CreateUserSchema, LoginSchema } from '@repo/utils';
import type { CreateUserDto, LoginDto } from '@repo/utils';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { RequestWithUser } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(CreateUserSchema)) registerDto: CreateUserDto,
  ) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Request() req: RequestWithUser) {
    return {
      id: req.user.userId,
      email: req.user.email,
      role: req.user.role,
    };
  }
}

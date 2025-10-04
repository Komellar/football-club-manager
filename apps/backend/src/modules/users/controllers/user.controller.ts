import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserApiSchema } from '@repo/core';
import type { CreateUserDto, UserResponseDto } from '@repo/core';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import {
  CreateUser,
  GetUserById,
} from '../decorators/user-endpoint.decorators';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreateUser()
  async create(
    @Body(new ZodValidationPipe(CreateUserApiSchema))
    createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userService.create(createUserDto);
    const { passwordHash: _, ...result } = user;
    return result;
  }

  @Get(':id')
  @GetUserById()
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash: _, ...result } = user;
    return result;
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<UserResponseDto> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash: _, ...result } = user;
    return result;
  }
}

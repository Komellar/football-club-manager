import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleType } from '@repo/core';
import type { UserResponseDto } from '@repo/core';
import type { RequestWithUser } from '@/modules/auth/types';
import { UserService } from '../services/user.service';
import { GetUserById } from '../decorators/user-endpoint.decorators';

/**
 * Accounts are created only through POST /auth/register. A user may read
 * their own record; admins may read any record.
 */
@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @GetUserById()
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ): Promise<UserResponseDto> {
    if (req.user.userId !== id && req.user.role !== RoleType.ADMIN) {
      throw new ForbiddenException('You can only view your own account');
    }
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash: _, ...result } = user;
    return result;
  }
}

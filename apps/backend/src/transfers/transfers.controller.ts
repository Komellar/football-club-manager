import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateTransferSchema,
  UpdateTransferSchema,
  TransferQuerySchema,
  type CreateTransferDto,
  type UpdateTransferDto,
  type TransferResponseDto,
  type TransferQueryDto,
  type PaginatedTransferResponseDto,
  type TransferHistoryDto,
} from '@repo/core';

@Controller('transfers')
@UseGuards(AuthGuard)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(CreateTransferSchema))
    createTransferDto: CreateTransferDto,
  ): Promise<TransferResponseDto> {
    return this.transfersService.create(createTransferDto);
  }

  @Get()
  async findAll(
    @Query(new ZodValidationPipe(TransferQuerySchema))
    queryDto?: TransferQueryDto,
  ): Promise<PaginatedTransferResponseDto> {
    return this.transfersService.findAll(queryDto);
  }

  @Get('player/:playerId')
  async findByPlayer(
    @Param('playerId', ParseIntPipe) playerId: number,
  ): Promise<TransferHistoryDto> {
    return this.transfersService.findByPlayer(playerId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TransferResponseDto> {
    return this.transfersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateTransferSchema))
    updateTransferDto: UpdateTransferDto,
  ): Promise<TransferResponseDto> {
    return this.transfersService.update(id, updateTransferDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.transfersService.remove(id);
  }
}

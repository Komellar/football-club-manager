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
import { TransfersService } from '../services/transfers.service';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import {
  CreateTransferSchema,
  UpdateTransferSchema,
  TransferListSchema,
  type CreateTransferDto,
  type UpdateTransferDto,
  type TransferResponseDto,
  type TransferListDto,
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
    @Query(new ZodValidationPipe(TransferListSchema))
    queryDto?: TransferListDto,
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

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
import { PlayerStatisticsService } from '../services/player-statistics.service';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import {
  CreatePlayerStatisticsSchema,
  UpdatePlayerStatisticsSchema,
  PlayerStatisticsQuerySchema,
  type CreatePlayerStatisticsDto,
  type UpdatePlayerStatisticsDto,
  type PlayerStatisticsResponseDto,
  type PlayerStatisticsQueryDto,
  type PaginationResult,
} from '@repo/core';

@Controller('statistics')
@UseGuards(AuthGuard)
export class PlayerStatisticsController {
  constructor(
    private readonly playerStatisticsService: PlayerStatisticsService,
  ) {}

  @Get()
  async findAll(
    @Query(new ZodValidationPipe(PlayerStatisticsQuerySchema))
    queryDto?: PlayerStatisticsQueryDto,
  ): Promise<PaginationResult<PlayerStatisticsResponseDto>> {
    return this.playerStatisticsService.findAll(queryDto);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlayerStatisticsResponseDto> {
    return this.playerStatisticsService.findOne(id);
  }

  @Get('player/:playerId')
  async getPlayerStatistics(
    @Param('playerId', ParseIntPipe) playerId: number,
    @Query(new ZodValidationPipe(PlayerStatisticsQuerySchema))
    queryDto?: PlayerStatisticsQueryDto,
  ): Promise<PaginationResult<PlayerStatisticsResponseDto>> {
    return this.playerStatisticsService.findAll({
      ...queryDto,
      where: {
        ...queryDto?.where,
        playerId,
      },
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(CreatePlayerStatisticsSchema))
    createStatisticsDto: CreatePlayerStatisticsDto,
  ): Promise<PlayerStatisticsResponseDto> {
    return this.playerStatisticsService.create(createStatisticsDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdatePlayerStatisticsSchema))
    updateStatisticsDto: UpdatePlayerStatisticsDto,
  ): Promise<PlayerStatisticsResponseDto> {
    return this.playerStatisticsService.update(id, updateStatisticsDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.playerStatisticsService.remove(id);
  }
}

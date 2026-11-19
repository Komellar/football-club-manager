import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiOkResponse } from '@nestjs/swagger';
import type { PlayerPerformanceSummary } from '@repo/core';
import { PlayerStatisticsService } from '../services/player-statistics.service';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import {
  PlayerStatisticsQuerySchema,
  type PlayerStatisticsResponseDto,
  type PlayerStatisticsQueryDto,
  type PaginationResult,
} from '@repo/core';
import {
  GetAllPlayerStatistics,
  GetPlayerStatisticsById,
  GetStatisticsByPlayer,
} from '../decorators/player-statistics-endpoint.decorators';

/**
 * Read-only: statistics are written only when a fixture completes, so they
 * always belong to a real match.
 */
@Controller('statistics')
@ApiTags('statistics')
@ApiBearerAuth()
export class PlayerStatisticsController {
  constructor(
    private readonly playerStatisticsService: PlayerStatisticsService,
  ) {}

  @Get()
  @GetAllPlayerStatistics()
  async findAll(
    @Query(new ZodValidationPipe(PlayerStatisticsQuerySchema))
    queryDto?: PlayerStatisticsQueryDto,
  ): Promise<PaginationResult<PlayerStatisticsResponseDto>> {
    return this.playerStatisticsService.findAll(queryDto);
  }

  @Get('player/:playerId/summary')
  @ApiOkResponse({
    description: 'Career and season totals across every recorded match',
  })
  async getPlayerSummary(
    @Param('playerId', ParseIntPipe) playerId: number,
  ): Promise<PlayerPerformanceSummary> {
    return this.playerStatisticsService.getPlayerSummary(playerId);
  }

  @Get(':id')
  @GetPlayerStatisticsById()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlayerStatisticsResponseDto> {
    return this.playerStatisticsService.findOne(id);
  }

  @Get('player/:playerId')
  @GetStatisticsByPlayer()
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
}

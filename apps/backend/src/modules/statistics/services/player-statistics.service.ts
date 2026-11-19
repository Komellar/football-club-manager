import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerStatistics } from '@/shared/entities/player-statistics.entity';
import { ListQueryBuilder } from '@/shared/query/list-query-builder';
import type {
  PlayerStatisticsResponseDto,
  PlayerStatisticsQueryDto,
  FilterOptions,
} from '@repo/core';
import { PaginationResult, FilterMode } from '@repo/core';
import {
  PLAYER_STATISTIC_TOTAL_FIELDS,
  PlayerStatisticsTotalsSchema,
  type PlayerPerformanceSummary,
} from '@repo/core';

@Injectable()
export class PlayerStatisticsService {
  constructor(
    @InjectRepository(PlayerStatistics)
    private statisticsRepository: Repository<PlayerStatistics>,
  ) {}

  async findAll(
    queryDto?: Partial<PlayerStatisticsQueryDto>,
  ): Promise<PaginationResult<PlayerStatisticsResponseDto>> {
    const filterOptions: FilterOptions = {
      defaultFilterMode: FilterMode.EXACT, // Use exact matching for statistics filters
    };
    return await ListQueryBuilder.executeQuery(
      this.statisticsRepository,
      queryDto,
      filterOptions,
    );
  }

  async findOne(id: number): Promise<PlayerStatisticsResponseDto> {
    return await this.statisticsRepository.findOneOrFail({
      where: { id },
    });
  }

  async getPlayerSummary(playerId: number): Promise<PlayerPerformanceSummary> {
    const query = this.statisticsRepository
      .createQueryBuilder('statistics')
      .select('statistics.season', 'season')
      .addSelect('COUNT(*)', 'appearances')
      .addSelect('COUNT(statistics.rating)', 'ratingCount')
      .addSelect('COALESCE(SUM(statistics.rating), 0)', 'ratingSum')
      .where('statistics.playerId = :playerId', { playerId })
      .groupBy('statistics.season')
      .orderBy('statistics.season', 'ASC');
    for (const field of PLAYER_STATISTIC_TOTAL_FIELDS) {
      query.addSelect(`COALESCE(SUM(statistics.${field}), 0)`, field);
    }
    const rows = await query.getRawMany<Record<string, string | number>>();
    const totals = PlayerStatisticsTotalsSchema.parse({
      appearances: 0,
      rating: null,
    });
    let ratingSum = 0;
    let ratingCount = 0;
    const seasons = rows.map((row) => {
      const season = {
        ...PlayerStatisticsTotalsSchema.parse({
          appearances: Number(row.appearances),
          rating: null,
        }),
        season: String(row.season),
      };
      for (const field of PLAYER_STATISTIC_TOTAL_FIELDS) {
        season[field] = Number(row[field] ?? 0);
        totals[field] += season[field];
      }
      const count = Number(row.ratingCount);
      const sum = Number(row.ratingSum);
      season.rating = count > 0 ? sum / count : null;
      totals.appearances += season.appearances;
      ratingSum += sum;
      ratingCount += count;
      return season;
    });
    totals.rating = ratingCount > 0 ? ratingSum / ratingCount : null;
    return { playerId, totals, seasons };
  }
}

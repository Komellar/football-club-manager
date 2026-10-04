import { Repository } from 'typeorm';
import { PlayerStatistics } from '@/shared/entities/player-statistics.entity';
import { PlayerStatisticsService } from '../services/player-statistics.service';
import { PlayerPerformanceSummarySchema } from '@repo/core';

describe('Complete player-performance totals', () => {
  const query = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };
  const repo = { createQueryBuilder: jest.fn(() => query) };
  const service = new PlayerStatisticsService(
    repo as unknown as Repository<PlayerStatistics>,
  );
  it('aggregates all appearances and weights ratings by rated rows, not season averages', async () => {
    query.getRawMany.mockResolvedValue([
      {
        season: '2024-2025',
        appearances: '20',
        goals: '12',
        assists: '6',
        minutesPlayed: '1800',
        ratingCount: '18',
        ratingSum: '126.0',
      },
      {
        season: '2025-2026',
        appearances: '10',
        goals: '8',
        assists: '3',
        minutesPlayed: '900',
        ratingCount: '10',
        ratingSum: '90.0',
      },
    ]);
    const summary = await service.getPlayerSummary(4);
    expect(summary.totals).toMatchObject({
      appearances: 30,
      minutesPlayed: 2700,
      goals: 20,
      assists: 9,
    });
    expect(summary.totals.rating).toBeCloseTo(216 / 28);
    expect(summary.seasons.map((season) => season.rating)).toEqual([7, 9]);
    expect(query.where).toHaveBeenCalledWith(
      'statistics.playerId = :playerId',
      { playerId: 4 },
    );
    expect(PlayerPerformanceSummarySchema.safeParse(summary).success).toBe(
      true,
    );
  });
  it('returns zero totals and a null rating for players without statistics', async () => {
    query.getRawMany.mockResolvedValue([]);
    const summary = await service.getPlayerSummary(99);
    expect(summary.totals).toMatchObject({
      appearances: 0,
      goals: 0,
      rating: null,
    });
    expect(summary.seasons).toEqual([]);
  });
});

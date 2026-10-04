import { z } from "zod";
import { CreatePlayerStatisticsSchema } from "./create";

export const PLAYER_STATISTIC_TOTAL_FIELDS = [
  "minutesPlayed",
  "goals",
  "assists",
  "yellowCards",
  "redCards",
  "savesMade",
  "goalsConceded",
  "shotsOnTarget",
  "shotsOffTarget",
  "fouls",
] as const;

export const PlayerStatisticsTotalsSchema = CreatePlayerStatisticsSchema.omit({
  playerId: true,
  season: true,
  rating: true,
}).extend({
  appearances: z.number().int().nonnegative(),
  rating: z.number().min(1).max(10).nullable(),
});
export const PlayerSeasonStatisticsSchema = PlayerStatisticsTotalsSchema.extend(
  {
    season: CreatePlayerStatisticsSchema.shape.season,
  },
);
export const PlayerPerformanceSummarySchema = z.object({
  playerId: z.number().int().positive(),
  totals: PlayerStatisticsTotalsSchema,
  seasons: z.array(PlayerSeasonStatisticsSchema),
});
export type PlayerStatisticsTotals = z.infer<
  typeof PlayerStatisticsTotalsSchema
>;
export type PlayerSeasonStatistics = z.infer<
  typeof PlayerSeasonStatisticsSchema
>;
export type PlayerPerformanceSummary = z.infer<
  typeof PlayerPerformanceSummarySchema
>;

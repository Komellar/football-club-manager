import { z } from "zod";
import {
  CreatePlayerStatisticsSchema,
  UpdatePlayerStatisticsSchema,
  PlayerStatisticsResponseSchema,
  PlayerStatisticsQuerySchema,
} from "../schemas/player-statistics";

export type CreatePlayerStatisticsDto = z.infer<
  typeof CreatePlayerStatisticsSchema
>;
export type UpdatePlayerStatisticsDto = z.infer<
  typeof UpdatePlayerStatisticsSchema
>;
export type PlayerStatisticsResponseDto = z.infer<
  typeof PlayerStatisticsResponseSchema
>;

export type PlayerStatisticsQueryDto = z.infer<
  typeof PlayerStatisticsQuerySchema
>;

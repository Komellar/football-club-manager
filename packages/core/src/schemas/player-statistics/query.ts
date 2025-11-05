import { z } from "zod";

export const PlayerStatisticsQuerySchema = z.object({
  where: z
    .object({
      playerId: z.coerce.number().int().positive().optional(),
      season: z.string().optional(),
    })
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

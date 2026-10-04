import { CreatePlayerStatisticsSchema } from "./create";
import { z } from "zod";

export const PlayerStatisticsResponseSchema =
  CreatePlayerStatisticsSchema.extend({
    id: z.number().int().positive(),
    matchId: z.uuid().nullable().optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  });

import { z } from "zod";

export const CreatePlayerStatisticsSchema = z.object({
  playerId: z.number().int().positive("Player ID must be a positive integer"),
  season: z
    .string()
    .regex(
      /^\d{4}-\d{4}$/,
      "Season must be in format YYYY-YYYY (e.g., 2023-2024)"
    ),
  matchesPlayed: z.number().int().min(0).default(0),
  minutesPlayed: z.number().int().min(0).default(0),
  goals: z.number().int().min(0).default(0),
  assists: z.number().int().min(0).default(0),
  yellowCards: z.number().int().min(0).default(0),
  redCards: z.number().int().min(0).default(0),
  cleanSheets: z.number().int().min(0).default(0),
  savesMade: z.number().int().min(0).default(0),
  rating: z.number().min(0).max(10).optional(),
  averageRating: z
    .number()
    .min(1, "Average rating must be at least 1.0")
    .max(10, "Average rating must be at most 10.0")
    .refine((val) => Number.isInteger(val * 10), {
      message: "Average rating must have at most 1 decimal place (e.g., 6.8)",
    })
    .optional(),
});

export const UpdatePlayerStatisticsSchema =
  CreatePlayerStatisticsSchema.partial().omit({ playerId: true, season: true });

export const PlayerStatisticsResponseSchema = z.object({
  id: z.number().int().positive(),
  playerId: z.number().int().positive(),
  season: z.string(),
  matchesPlayed: z.number().int().min(0),
  minutesPlayed: z.number().int().min(0),
  goals: z.number().int().min(0),
  assists: z.number().int().min(0),
  yellowCards: z.number().int().min(0),
  redCards: z.number().int().min(0),
  cleanSheets: z.number().int().min(0),
  savesMade: z.number().int().min(0),
  rating: z.number().optional(),
  averageRating: z.number().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CreatePlayerStatisticsDto = z.infer<
  typeof CreatePlayerStatisticsSchema
>;
export type UpdatePlayerStatisticsDto = z.infer<
  typeof UpdatePlayerStatisticsSchema
>;
export type PlayerStatisticsResponseDto = z.infer<
  typeof PlayerStatisticsResponseSchema
>;

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

export type PlayerStatisticsQueryDto = z.infer<
  typeof PlayerStatisticsQuerySchema
>;

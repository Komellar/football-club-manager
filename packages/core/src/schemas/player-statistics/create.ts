import { z } from "zod";

export const CreatePlayerStatisticsSchema = z.object({
  playerId: z.number().int().positive("Player ID must be a positive integer"),
  season: z
    .string()
    .regex(
      /^\d{4}-\d{4}$/,
      "Season must be in format YYYY-YYYY (e.g., 2023-2024)"
    ),
  minutesPlayed: z.number().int().min(0).default(0),
  goals: z.number().int().min(0).default(0),
  assists: z.number().int().min(0).default(0),
  yellowCards: z.number().int().min(0).default(0),
  redCards: z.number().int().min(0).default(0),
  savesMade: z.number().int().min(0).default(0),
  goalsConceded: z.number().int().min(0).default(0),
  shotsOnTarget: z.number().int().min(0).default(0),
  shotsOffTarget: z.number().int().min(0).default(0),
  fouls: z.number().int().min(0).default(0),
  rating: z
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

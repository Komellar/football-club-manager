import { z } from "zod";
import { PlayerPosition } from "../enums/player-position";
import { isValidPlayerAge } from "../utils/age-utils";

// Player validation schemas for Zod v4
export const CreatePlayerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Player name is required")
    .max(100, "Player name must be less than 100 characters")
    .regex(
      /^[a-zA-Z\s\-'\.]+$/,
      "Name can only contain letters, spaces, hyphens, apostrophes, and periods"
    ),

  position: z
    .enum([
      PlayerPosition.GOALKEEPER,
      PlayerPosition.DEFENDER,
      PlayerPosition.MIDFIELDER,
      PlayerPosition.FORWARD,
    ])
    .describe("Player position on the field"),

  dateOfBirth: z.coerce
    .date()
    .refine(
      (date) => isValidPlayerAge(date),
      "Player must be between 15 and 50 years old"
    ),

  nationality: z
    .string()
    .trim()
    .min(1, "Nationality is required")
    .max(50, "Nationality must be less than 50 characters"),

  height: z
    .number()
    .int()
    .min(120, "Height must be at least 120 cm")
    .max(220, "Height must be at most 220 cm")
    .optional(),

  weight: z
    .number()
    .positive("Weight must be positive")
    .min(40, "Weight must be at least 40 kg")
    .max(150, "Weight must be at most 150 kg")
    .optional(),

  jerseyNumber: z
    .number()
    .int()
    .min(1, "Jersey number must be at least 1")
    .max(99, "Jersey number must be at most 99")
    .optional(),

  marketValue: z.number().positive("Market value must be positive").optional(),

  isActive: z.boolean().default(true),

  imageUrl: z.url("Image URL must be a valid URL").optional(),
});

export const UpdatePlayerSchema = CreatePlayerSchema.partial();

export const PlayerResponseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  position: z.enum([
    PlayerPosition.GOALKEEPER,
    PlayerPosition.DEFENDER,
    PlayerPosition.MIDFIELDER,
    PlayerPosition.FORWARD,
  ]),
  dateOfBirth: z.coerce.date(),
  nationality: z.string(),
  height: z.number().optional(),
  weight: z.number().optional(),
  jerseyNumber: z.number().optional(),
  marketValue: z.number().optional(),
  isActive: z.boolean(),
  imageUrl: z.url().optional(),
  age: z.number().int().min(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Type inference
export type CreatePlayerDto = z.infer<typeof CreatePlayerSchema>;
export type UpdatePlayerDto = z.infer<typeof UpdatePlayerSchema>;
export type PlayerResponseDto = z.infer<typeof PlayerResponseSchema>;

// Base Player type for frontend use
export const PlayerSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  position: z.enum([
    PlayerPosition.GOALKEEPER,
    PlayerPosition.DEFENDER,
    PlayerPosition.MIDFIELDER,
    PlayerPosition.FORWARD,
  ]),
  dateOfBirth: z.coerce.date(),
  nationality: z.string(),
  height: z.number().optional(),
  weight: z.number().optional(),
  jerseyNumber: z.number().optional(),
  marketValue: z.number().optional(),
  isActive: z.boolean(),
  imageUrl: z.url().optional(),
  age: z.number().int().min(0),
});

export type Player = z.infer<typeof PlayerSchema>;

// Utility schemas for common patterns
export const PlayerIdSchema = z.object({
  playerId: z.coerce
    .number()
    .int()
    .positive("Player ID must be a positive integer"),
});

export const PlayerQuerySchema = z.object({
  position: z
    .enum([
      PlayerPosition.GOALKEEPER,
      PlayerPosition.DEFENDER,
      PlayerPosition.MIDFIELDER,
      PlayerPosition.FORWARD,
    ])
    .optional(),
  isActive: z.coerce.boolean().optional(),
  nationality: z.string().optional(),
  minAge: z.coerce.number().int().min(0).optional(),
  maxAge: z.coerce.number().int().min(0).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["name", "position", "age", "nationality", "marketValue"])
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type PlayerQueryDto = z.infer<typeof PlayerQuerySchema>;

// Pagination response schema
export const PaginatedPlayerResponseSchema = z.object({
  data: z.array(PlayerResponseSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export type PaginatedPlayerResponseDto = z.infer<
  typeof PaginatedPlayerResponseSchema
>;

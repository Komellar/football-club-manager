import { z } from "zod";
import { PlayerPosition } from "../../enums/player-position";
import { isValidPlayerAge } from "../../utils/age-utils";
import { VALID_NATIONALITIES } from "../../constants/confederations";
import type { ValidNationality } from "../../types/nationality";

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
  nationality: z.enum(VALID_NATIONALITIES),
  height: z.number().optional(),
  weight: z.number().optional(),
  jerseyNumber: z.number().optional(),
  marketValue: z.number().optional(),
  isActive: z.boolean().default(true),
  imageUrl: z.url().optional(),
  age: z.number().int().min(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

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
    .enum(
      [
        PlayerPosition.GOALKEEPER,
        PlayerPosition.DEFENDER,
        PlayerPosition.MIDFIELDER,
        PlayerPosition.FORWARD,
      ],
      {
        message: "Invalid player position",
      }
    )
    .describe("Player position on the field"),

  dateOfBirth: z.coerce
    .date<Date>("Invalid date")
    .refine(
      (date) => isValidPlayerAge(date),
      "Player must be between 15 and 50 years old"
    ),

  nationality: z
    .enum(VALID_NATIONALITIES, {
      message:
        "Invalid nationality code. Must be a valid FIFA-recognized country",
    })
    .describe("Player nationality - 3-letter ISO country code"),

  height: z
    .number()
    .int()
    .min(100, "Height must be at least 100 cm")
    .max(250, "Height must be at most 250 cm")
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

  isActive: z.boolean(),

  imageUrl: z.url("Image URL must be a valid URL").optional(),
});

export const UpdatePlayerSchema = CreatePlayerSchema.partial();

export type Player = z.infer<typeof PlayerSchema>;
export type CreatePlayerDto = z.infer<typeof CreatePlayerSchema>;
export type UpdatePlayerDto = z.infer<typeof UpdatePlayerSchema>;

import { z } from "zod";
import { PlayerPosition } from "../../enums/player-position";
import { isValidPlayerAge } from "../../utils/age-utils";
import { VALID_NATIONALITIES } from "../../constants/confederations";

const EARLIEST_BIRTH_DATE = new Date("1900-01-01");

/**
 * Fields shared by create, update and responses. The date of birth only has
 * to be plausible here; the 15–50 signing age applies at creation, so an
 * existing player stays editable after turning 51.
 */
export const PlayerInputSchema = z.object({
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
    .enum(PlayerPosition, {
      message: "Invalid player position",
    })
    .describe("Player position on the field"),

  dateOfBirth: z.coerce
    .date<Date>("Invalid date")
    .refine(
      (date) => date >= EARLIEST_BIRTH_DATE && date <= new Date(),
      "Date of birth must be in the past"
    ),

  country: z
    .enum(VALID_NATIONALITIES, {
      message: "Invalid country code. Must be a valid FIFA-recognized country",
    })
    .describe("Player country - 3-letter ISO country code"),

  height: z
    .number()
    .int()
    .min(100, "Height must be at least 100 cm")
    .max(250, "Height must be at most 250 cm")
    .optional()
    .nullable(),

  weight: z
    .number()
    .positive("Weight must be positive")
    .min(40, "Weight must be at least 40 kg")
    .max(150, "Weight must be at most 150 kg")
    .optional()
    .nullable(),

  jerseyNumber: z
    .number()
    .int()
    .min(1, "Jersey number must be at least 1")
    .max(99, "Jersey number must be at most 99")
    .optional()
    .nullable(),

  marketValue: z
    .number()
    .positive("Market value must be positive")
    .optional()
    .nullable(),

  isActive: z.boolean(),

  imageUrl: z.url("Image URL must be a valid URL").optional().nullable(),
});

export const CreatePlayerSchema = PlayerInputSchema.extend({
  dateOfBirth: PlayerInputSchema.shape.dateOfBirth.refine(
    (date) => isValidPlayerAge(date),
    "Player must be between 15 and 50 years old"
  ),
});

/** Full replacement of an existing player; no signing-age limit. */
export const UpdatePlayerSchema = PlayerInputSchema;

export type CreatePlayerDto = z.infer<typeof CreatePlayerSchema>;
export type UpdatePlayerDto = z.infer<typeof UpdatePlayerSchema>;

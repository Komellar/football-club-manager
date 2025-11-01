import { z } from "zod";
import { PlayerPosition } from "../../enums/player-position";
import { createPaginationResponseSchema } from "../../utils/schema-utils";

export const PlayerResponseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  position: z.enum(PlayerPosition),
  dateOfBirth: z.coerce.date(),
  country: z.string(),
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

export const PaginatedPlayerResponseSchema =
  createPaginationResponseSchema(PlayerResponseSchema);

export type PlayerResponseDto = z.infer<typeof PlayerResponseSchema>;
export type PaginatedPlayerResponseDto = z.infer<
  typeof PaginatedPlayerResponseSchema
>;

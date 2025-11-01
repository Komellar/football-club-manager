import { z } from "zod";
import { createPaginationResponseSchema } from "../../utils/schema-utils";
import { CreatePlayerSchema } from "./player-input-schemas";

export const PlayerResponseSchema = CreatePlayerSchema.extend({
  id: z.number().int().positive(),
  age: z.number().int().min(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  country: z.string().length(3),
});

export const PaginatedPlayerResponseSchema =
  createPaginationResponseSchema(PlayerResponseSchema);

export type PlayerResponseDto = z.infer<typeof PlayerResponseSchema>;
export type PaginatedPlayerResponseDto = z.infer<
  typeof PaginatedPlayerResponseSchema
>;

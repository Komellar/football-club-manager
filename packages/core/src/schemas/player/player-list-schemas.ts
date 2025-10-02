import { z } from "zod";
import { PlayerPosition } from "../../enums/player-position";
import { ListQueryParamsSchema } from "../list/pagination-schemas";
import { createPaginationResponseSchema } from "../../utils/schema-utils";
import { PlayerResponseSchema } from "./player-response-schemas";

export const PlayerListSchema = ListQueryParamsSchema.extend({
  where: z
    .object({
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
      minHeight: z.coerce.number().positive().optional(),
      maxHeight: z.coerce.number().positive().optional(),
      minWeight: z.coerce.number().positive().optional(),
      maxWeight: z.coerce.number().positive().optional(),
      minMarketValue: z.coerce.number().positive().optional(),
      maxMarketValue: z.coerce.number().positive().optional(),
    })
    .optional(),
  sortBy: z
    .enum(["name", "age", "position", "marketValue", "createdAt"])
    .default("name")
    .optional(),
  sortOrder: z.enum(["ASC", "DESC"]).default("ASC").optional(),
});

export const PaginatedPlayerListResponseSchema =
  createPaginationResponseSchema(PlayerResponseSchema);

export type PlayerListDto = z.infer<typeof PlayerListSchema>;
export type PaginatedPlayerListResponseDto = z.infer<
  typeof PaginatedPlayerListResponseSchema
>;

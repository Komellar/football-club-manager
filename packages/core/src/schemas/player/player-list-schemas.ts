import { z } from "zod";
import { PlayerPosition } from "../../enums/player-position";
import { SortOrder } from "../../enums/list";
import { ListQueryParamsSchema } from "../list/pagination-schemas";
import { createPaginationResponseSchema } from "../../utils/schema-utils";
import { PlayerResponseSchema } from "./player-response-schemas";
import { VALID_NATIONALITIES } from "../../constants/confederations";

export const PlayerListSchema = ListQueryParamsSchema.extend({
  where: z
    .object({
      position: z.enum(PlayerPosition).optional(),
      isActive: z.coerce.boolean().optional(),
      nationality: z.enum(VALID_NATIONALITIES).optional(),
      dateOfBirth: z.array(z.coerce.date()).length(2).optional(),
    })
    .optional(),
  sort: z
    .object({
      by: z
        .enum(["name", "age", "position", "marketValue", "createdAt"])
        .default("name"),
      order: z.enum(SortOrder).default(SortOrder.ASC).optional(),
    })
    .optional(),
});

export const PaginatedPlayerListResponseSchema =
  createPaginationResponseSchema(PlayerResponseSchema);

export type PlayerListDto = z.infer<typeof PlayerListSchema>;
export type PaginatedPlayerListResponseDto = z.infer<
  typeof PaginatedPlayerListResponseSchema
>;

import { z } from "zod";
import { PlayerPosition } from "../../enums/player-position";
import { SortOrder } from "../../enums/list";
import { ListQueryParamsSchema } from "../list/pagination-schemas";
import { createPaginationResponseSchema } from "../../utils/schema-utils";
import { PlayerResponseSchema } from "./player-response-schemas";
import { VALID_NATIONALITIES } from "../../constants/confederations";

export const PLAYER_SORT_COLUMNS = [
  "name",
  "dateOfBirth",
  "position",
  "marketValue",
  "createdAt",
] as const;
export type PlayerSortColumn = (typeof PLAYER_SORT_COLUMNS)[number];

export const PlayerListFiltersSchema = z.object({
  position: z.enum(PlayerPosition).optional(),
  isActive: z
    .union([
      z.boolean(),
      z
        .string()
        .transform(
          (val) => val === "true" || (val === "false" ? false : undefined)
        )
        .pipe(z.boolean()),
    ])
    .optional(),
  country: z.enum(VALID_NATIONALITIES).optional(),
});

export const PlayerListSchema = ListQueryParamsSchema.extend({
  where: PlayerListFiltersSchema.optional(),
  sort: z
    .object({
      by: z.enum(PLAYER_SORT_COLUMNS).default("createdAt"),
      order: z.enum(SortOrder).default(SortOrder.ASC).optional(),
    })
    .optional(),
});

export const PaginatedPlayerListResponseSchema =
  createPaginationResponseSchema(PlayerResponseSchema);

export type PlayerListFilters = z.infer<typeof PlayerListFiltersSchema>;
export type PlayerListDto = z.infer<typeof PlayerListSchema>;
export type PaginatedPlayerListResponseDto = z.infer<
  typeof PaginatedPlayerListResponseSchema
>;

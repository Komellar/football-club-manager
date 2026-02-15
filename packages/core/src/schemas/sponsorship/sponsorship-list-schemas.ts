import { z } from "zod";
import { SponsorshipType, SponsorshipStatus } from "../../enums/sponsorship";
import { SortOrder } from "../../enums/list";
import { ListQueryParamsSchema } from "../list/pagination-schemas";
import { createPaginationResponseSchema } from "../../utils/schema-utils";
import { DateRangeQuerySchema } from "../list/date-range-schemas";
import { SponsorshipResponseSchema } from "./sponsorship-response-schemas";

export const SPONSORSHIP_SORT_COLUMNS = [
  "sponsorName",
  "sponsorshipType",
  "sponsorshipStatus",
  "startDate",
  "endDate",
  "annualValue",
  "createdAt",
] as const;
export type SponsorshipSortColumn = (typeof SPONSORSHIP_SORT_COLUMNS)[number];

export const SponsorshipListFiltersSchema = z.object({
  ...DateRangeQuerySchema.shape,
  sponsorshipType: z.enum(SponsorshipType).optional(),
  sponsorshipStatus: z.enum(SponsorshipStatus).optional(),
  sponsorName: z.string().optional(),
});

export const SponsorshipListSchema = ListQueryParamsSchema.extend({
  where: SponsorshipListFiltersSchema.optional(),
  sort: z
    .object({
      by: z.enum(SPONSORSHIP_SORT_COLUMNS).default("createdAt"),
      order: z.enum(SortOrder).default(SortOrder.DESC).optional(),
    })
    .optional(),
});

export const PaginatedSponsorshipResponseSchema =
  createPaginationResponseSchema(SponsorshipResponseSchema);

export type SponsorshipListDto = z.infer<typeof SponsorshipListSchema>;
export type PaginatedSponsorshipResponseDto = z.infer<
  typeof PaginatedSponsorshipResponseSchema
>;

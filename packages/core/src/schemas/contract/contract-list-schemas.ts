import { z } from "zod";
import { ContractStatus, ContractType } from "../../enums";
import { SortOrder } from "../../enums/list";
import { ListQueryParamsSchema } from "../list/pagination-schemas";
import { createPaginationResponseSchema } from "../../utils/schema-utils";
import { DateRangeQuerySchema } from "../list/date-range-schemas";
import { ContractResponseSchema } from "./contract-response-schemas";

export const CONTRACT_SORT_COLUMNS = [
  "contractType",
  "status",
  "startDate",
  "endDate",
  "salary",
  "createdAt",
  "bonuses",
  "releaseClause",
] as const;
export type ContractSortColumn = (typeof CONTRACT_SORT_COLUMNS)[number];

export const ContractListFiltersSchema = z.object({
  ...DateRangeQuerySchema.shape,
  playerId: z.coerce.number().int().positive().optional(),
  status: z.enum(ContractStatus).optional(),
  contractType: z.enum(ContractType).optional(),
});

export const ContractListSchema = ListQueryParamsSchema.extend({
  where: ContractListFiltersSchema.optional(),
  sort: z
    .object({
      by: z.enum(CONTRACT_SORT_COLUMNS).default("createdAt"),
      order: z.enum(SortOrder).default(SortOrder.DESC).optional(),
    })
    .optional(),
});

export const PaginatedContractListResponseSchema =
  createPaginationResponseSchema(ContractResponseSchema);

// Query schemas for contract expiry endpoints
export const ExpiryQuerySchema = z.object({
  days: z.coerce.number().int().min(1).optional(),
});

export const ReportQuerySchema = z.object({
  days: z.coerce.number().int().min(1).optional(),
});

export type ContractListFilters = z.infer<typeof ContractListFiltersSchema>;
export type ContractListDto = z.infer<typeof ContractListSchema>;
export type PaginatedContractListResponseDto = z.infer<
  typeof PaginatedContractListResponseSchema
>;
export type ExpiryQuery = z.infer<typeof ExpiryQuerySchema>;
export type ReportQuery = z.infer<typeof ReportQuerySchema>;

import { z } from "zod";
import { ContractStatus, ContractType } from "../../enums";
import { SortOrder } from "../../enums/list";
import { ListQueryParamsSchema } from "../list/pagination-schemas";
import { createPaginationResponseSchema } from "../../utils/schema-utils";
import { DateRangeQuerySchema } from "../list/date-range-schemas";
import { ContractResponseSchema } from "./contract-response-schemas";

export const ContractListSchema = ListQueryParamsSchema.extend({
  where: z
    .object({
      ...DateRangeQuerySchema.shape,
      playerId: z.coerce.number().int().positive().optional(),
      status: z.enum(ContractStatus).optional(),
      contractType: z.enum(ContractType).optional(),
      minSalary: z.coerce.number().positive().optional(),
      maxSalary: z.coerce.number().positive().optional(),
      currency: z.string().length(3).optional(),
    })
    .optional(),
  sort: z
    .object({
      by: z
        .enum(["startDate", "endDate", "salary", "createdAt"])
        .default("createdAt"),
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

export type ContractListDto = z.infer<typeof ContractListSchema>;
export type PaginatedContractListResponseDto = z.infer<
  typeof PaginatedContractListResponseSchema
>;
export type ExpiryQuery = z.infer<typeof ExpiryQuerySchema>;
export type ReportQuery = z.infer<typeof ReportQuerySchema>;

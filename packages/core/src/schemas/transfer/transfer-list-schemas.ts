import { z } from "zod";
import {
  TransferType,
  TransferStatus,
  TransferDirection,
} from "../../enums/transfer";
import { SortOrder } from "../../enums/list";
import { ListQueryParamsSchema } from "../list/pagination-schemas";
import { createPaginationResponseSchema } from "../../utils/schema-utils";
import { DateRangeQuerySchema } from "../list/date-range-schemas";
import { TransferResponseSchema } from "./transfer-response-schemas";

export const TRANSFER_SORT_COLUMNS = [
  "transferDirection",
  "transferDate",
  "transferType",
  "transferStatus",
  "transferFee",
  "isCompleted",
  "otherClubName",
  "createdAt",
] as const;
export type TransferSortColumn = (typeof TRANSFER_SORT_COLUMNS)[number];

export const TransferListFiltersSchema = z.object({
  ...DateRangeQuerySchema.shape,
  playerId: z.coerce.number().int().positive().optional(),
  transferType: z.enum(TransferType).optional(),
  transferStatus: z.enum(TransferStatus).optional(),
  transferDirection: z.enum(TransferDirection).optional(),
  otherClubName: z.string().optional(),
});

export const TransferListSchema = ListQueryParamsSchema.extend({
  where: TransferListFiltersSchema.optional(),
  sort: z
    .object({
      by: z.enum(TRANSFER_SORT_COLUMNS).default("createdAt"),
      order: z.enum(SortOrder).default(SortOrder.DESC).optional(),
    })
    .optional(),
});

export const PaginatedTransferResponseSchema = createPaginationResponseSchema(
  TransferResponseSchema
);

export type TransferListDto = z.infer<typeof TransferListSchema>;
export type PaginatedTransferResponseDto = z.infer<
  typeof PaginatedTransferResponseSchema
>;

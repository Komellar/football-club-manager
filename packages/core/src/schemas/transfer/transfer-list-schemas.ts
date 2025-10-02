import { z } from "zod";
import { TransferType, TransferStatus } from "../../enums/transfer";
import { ListQueryParamsSchema } from "../list/pagination-schemas";
import { createPaginationResponseSchema } from "../../utils/schema-utils";
import { DateRangeQuerySchema } from "../list/date-range-schemas";
import { TransferResponseSchema } from "./transfer-response-schemas";

export const TransferListSchema = ListQueryParamsSchema.extend({
  where: z
    .object({
      ...DateRangeQuerySchema.shape,
      playerId: z.coerce.number().int().positive().optional(),
      transferType: z
        .enum([
          TransferType.SIGNING,
          TransferType.LOAN,
          TransferType.LOAN_RETURN,
          TransferType.SALE,
          TransferType.RELEASE,
          TransferType.RETIREMENT,
        ])
        .optional(),
      transferStatus: z
        .enum([
          TransferStatus.PENDING,
          TransferStatus.COMPLETED,
          TransferStatus.CANCELLED,
        ])
        .optional(),
      fromClub: z.string().optional(),
      toClub: z.string().optional(),
      isPermanent: z.coerce.boolean().optional(),
      minFee: z.coerce.number().positive().optional(),
      maxFee: z.coerce.number().positive().optional(),
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

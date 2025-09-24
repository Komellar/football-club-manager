import { z } from "zod";
import { TransferType } from "../enums/transfer-type";
import { TransferStatus } from "../enums/transfer-status";
import {
  createPaginationResultSchema,
  BaseQuerySchema,
  DateRangeQuerySchema,
} from "./shared-schemas";

export const CreateTransferSchema = z
  .object({
    playerId: z.number().int().positive("Player ID must be a positive integer"),

    fromClub: z
      .string()
      .trim()
      .max(100, "From club name must be less than 100 characters")
      .optional(),

    toClub: z
      .string()
      .trim()
      .min(3, "To club is required")
      .max(100, "To club name must be less than 100 characters"),

    transferType: z.enum([
      TransferType.SIGNING,
      TransferType.LOAN,
      TransferType.LOAN_RETURN,
      TransferType.SALE,
      TransferType.RELEASE,
      TransferType.RETIREMENT,
    ]),

    transferStatus: z
      .enum([
        TransferStatus.PENDING,
        TransferStatus.COMPLETED,
        TransferStatus.CANCELLED,
      ])
      .default(TransferStatus.PENDING),

    transferDate: z.coerce.date(),

    transferFee: z
      .number()
      .positive("Transfer fee must be positive")
      .max(500000000, "Transfer fee cannot exceed 500 million")
      .optional(),

    agentFee: z
      .number()
      .positive("Agent fee must be positive")
      .max(50000000, "Agent fee cannot exceed 50 million")
      .optional(),

    annualSalary: z
      .number()
      .positive("Annual salary must be positive")
      .max(100000000, "Annual salary cannot exceed 100 million")
      .optional(),

    contractLengthMonths: z
      .number()
      .int()
      .min(1, "Contract length must be at least 1 month")
      .max(120, "Contract length cannot exceed 120 months")
      .optional(),

    loanEndDate: z.coerce.date().optional(),

    notes: z
      .string()
      .max(1000, "Notes must be less than 1000 characters")
      .optional(),

    isPermanent: z.boolean().default(false),

    createdBy: z
      .string()
      .max(100, "Created by must be less than 100 characters")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.transferType === TransferType.LOAN) {
      if (!data.loanEndDate) {
        ctx.addIssue({
          code: "custom",
          message: "Loan end date is required for loan transfers",
          path: ["loanEndDate"],
        });
      } else if (data.loanEndDate <= data.transferDate) {
        ctx.addIssue({
          code: "custom",
          message: "Loan end date must be after transfer date",
          path: ["loanEndDate"],
        });
      }

      if (data.isPermanent) {
        ctx.addIssue({
          code: "custom",
          message: "Loan transfers cannot be permanent",
          path: ["isPermanent"],
        });
      }
    }

    if (data.transferType === TransferType.SIGNING && !data.isPermanent) {
      data.isPermanent = true;
    }

    if (data.transferType === TransferType.RETIREMENT) {
      if (data.toClub && data.toClub !== "RETIRED") {
        ctx.addIssue({
          code: "custom",
          message: "Retirement transfers should have 'RETIRED' as destination",
          path: ["toClub"],
        });
      }
    }
  });

export const UpdateTransferSchema = CreateTransferSchema.partial().omit({
  playerId: true,
});

export const TransferResponseSchema = z.object({
  id: z.number().int().positive(),
  playerId: z.number().int().positive(),
  fromClub: z.string().optional(),
  toClub: z.string(),
  transferType: z.enum([
    TransferType.SIGNING,
    TransferType.LOAN,
    TransferType.LOAN_RETURN,
    TransferType.SALE,
    TransferType.RELEASE,
    TransferType.RETIREMENT,
  ]),
  transferStatus: z.enum([
    TransferStatus.PENDING,
    TransferStatus.COMPLETED,
    TransferStatus.CANCELLED,
  ]),
  transferDate: z.coerce.date(),
  transferFee: z.number().optional(),
  agentFee: z.number().optional(),
  annualSalary: z.number().optional(),
  contractLengthMonths: z.number().optional(),
  loanEndDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  isPermanent: z.boolean(),
  createdBy: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  isCompleted: z.boolean(),
  isActiveLoan: z.boolean(),
  transferDurationDays: z.number().optional(),
});

export type CreateTransferDto = z.infer<typeof CreateTransferSchema>;
export type UpdateTransferDto = z.infer<typeof UpdateTransferSchema>;
export type TransferResponseDto = z.infer<typeof TransferResponseSchema>;

export const TransferQuerySchema = BaseQuerySchema.extend({
  ...DateRangeQuerySchema.shape,
  // Transfer-specific fields
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
  sortBy: z
    .enum(["transferDate", "transferFee", "toClub", "fromClub"])
    .default("transferDate"),
});

export type TransferQueryDto = z.infer<typeof TransferQuerySchema>;

export const PaginatedTransferResponseSchema = createPaginationResultSchema(
  TransferResponseSchema
);

export type PaginatedTransferResponseDto = z.infer<
  typeof PaginatedTransferResponseSchema
>;

export const TransferHistorySchema = z.object({
  playerId: z.number().int().positive(),
  playerName: z.string(),
  transfers: z.array(TransferResponseSchema),
  totalTransfers: z.number().int().min(0),
  currentClub: z.string().optional(),
  careerTransfersValue: z.number().min(0).optional(),
});

export type TransferHistoryDto = z.infer<typeof TransferHistorySchema>;

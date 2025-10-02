import { z } from "zod";
import { TransferType, TransferStatus } from "../../enums/transfer";

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
      .positive("Contract length must be positive")
      .max(120, "Contract length cannot exceed 10 years (120 months)")
      .optional(),

    loanEndDate: z.coerce.date().optional(),

    notes: z
      .string()
      .trim()
      .max(1000, "Notes must be less than 1000 characters")
      .optional(),

    isPermanent: z.boolean().optional(),

    createdBy: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    // Business logic validations
    if (data.transferType === TransferType.LOAN && data.isPermanent) {
      ctx.addIssue({
        code: "custom",
        message: "Loan transfers cannot be permanent",
        path: ["isPermanent"],
      });
    }

    if (data.transferType === TransferType.LOAN && !data.loanEndDate) {
      ctx.addIssue({
        code: "custom",
        message: "Loan transfers must have an end date",
        path: ["loanEndDate"],
      });
    }

    if (data.transferType !== TransferType.LOAN && data.loanEndDate) {
      ctx.addIssue({
        code: "custom",
        message: "Only loan transfers can have an end date",
        path: ["loanEndDate"],
      });
    }

    if (
      data.transferType === TransferType.LOAN_RETURN &&
      !data.fromClub &&
      !data.toClub
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Loan return transfers must specify clubs",
        path: ["fromClub"],
      });
    }

    if (data.transferType === TransferType.LOAN && data.isPermanent) {
      ctx.addIssue({
        code: "custom",
        message: "Loan transfers cannot be permanent",
        path: ["isPermanent"],
      });
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

export type CreateTransferDto = z.infer<typeof CreateTransferSchema>;
export type UpdateTransferDto = z.infer<typeof UpdateTransferSchema>;

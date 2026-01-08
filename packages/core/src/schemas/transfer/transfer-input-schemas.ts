import { z } from "zod";
import {
  TransferType,
  TransferStatus,
  TransferDirection,
} from "../../enums/transfer";

export const CreateTransferSchema = z
  .object({
    playerId: z.number().int().positive("Player ID must be a positive integer"),

    otherClubName: z
      .string()
      .trim()
      .min(3, "Other club name is required")
      .max(100, "Other club name must be less than 100 characters")
      .optional(),

    transferDirection: z.enum(TransferDirection),

    transferType: z.enum(TransferType),

    transferStatus: z.enum(TransferStatus),

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

    loanEndDate: z.coerce.date().optional(),

    notes: z
      .string()
      .trim()
      .max(1000, "Notes must be less than 1000 characters")
      .optional(),

    createdBy: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    // Business logic validations
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

    // Validate club name requirements based on transfer type and direction
    const requiresOtherClub = [
      TransferType.SIGNING,
      TransferType.LOAN,
      TransferType.LOAN_RETURN,
      TransferType.SALE,
    ].includes(data.transferType);

    if (requiresOtherClub && !data.otherClubName) {
      ctx.addIssue({
        code: "custom",
        message: "This transfer type requires specifying the other club",
        path: ["otherClubName"],
      });
    }

    if (
      (data.transferType === TransferType.RETIREMENT ||
        data.transferType === TransferType.RELEASE) &&
      data.otherClubName
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "Retirement and release transfers should not specify another club",
        path: ["otherClubName"],
      });
    }

    // Validate transfer direction logic
    if (
      data.transferType === TransferType.SIGNING &&
      data.transferDirection !== TransferDirection.INCOMING
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Signings must be incoming transfers",
        path: ["transferDirection"],
      });
    }

    if (
      data.transferType === TransferType.SALE &&
      data.transferDirection !== TransferDirection.OUTGOING
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Sales must be outgoing transfers",
        path: ["transferDirection"],
      });
    }
  });

export const UpdateTransferSchema = CreateTransferSchema.partial().omit({
  playerId: true,
});

export type CreateTransferDto = z.infer<typeof CreateTransferSchema>;
export type UpdateTransferDto = z.infer<typeof UpdateTransferSchema>;

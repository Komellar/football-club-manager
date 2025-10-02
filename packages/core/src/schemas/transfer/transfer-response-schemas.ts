import { z } from "zod";
import { TransferType, TransferStatus } from "../../enums/transfer";

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

export const TransferHistorySchema = z.object({
  playerId: z.number().int().positive(),
  playerName: z.string(),
  transfers: z.array(TransferResponseSchema),
  totalTransfers: z.number().int().min(0),
  currentClub: z.string().optional(),
  careerTransfersValue: z.number().min(0).optional(),
});

export type TransferResponseDto = z.infer<typeof TransferResponseSchema>;
export type TransferHistoryDto = z.infer<typeof TransferHistorySchema>;

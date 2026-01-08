import { z } from "zod";
import {
  TransferType,
  TransferStatus,
  TransferDirection,
} from "../../enums/transfer";
import { PlayerResponseSchema } from "../player";

export const TransferResponseSchema = z.object({
  id: z.number().int().positive(),
  playerId: z.number().int().positive(),
  otherClubName: z.string().optional(),
  transferDirection: z.enum(TransferDirection),
  transferType: z.enum(TransferType),
  transferStatus: z.enum(TransferStatus),
  transferDate: z.coerce.date(),
  transferFee: z.number().optional(),
  agentFee: z.number().optional(),
  loanEndDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  isCompleted: z.boolean(),
  isActiveLoan: z.boolean(),
  transferDurationDays: z.number().optional(),
  player: PlayerResponseSchema.optional(),
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

import {
  CreateTransferDto,
  TransferDirection,
  TransferResponseDto,
} from "@repo/core";
import { TRANSFER_TYPE_OPTIONS } from "../constants/form-constants";

export function getAvailableTransferTypes(
  transferDirection?: TransferDirection
) {
  if (!transferDirection) return [];

  if (transferDirection === TransferDirection.INCOMING) {
    return TRANSFER_TYPE_OPTIONS.filter((opt) =>
      ["signing", "loan", "loan_return"].includes(opt.value)
    );
  } else {
    return TRANSFER_TYPE_OPTIONS.filter((opt) =>
      ["sale", "loan", "loan_return", "release", "retirement"].includes(
        opt.value
      )
    );
  }
}

export function getPlayerOptions(players: Array<{ id: number; name: string }>) {
  return players.map((player) => ({
    value: player.id.toString(),
    label: player.name,
  }));
}

export function transformToFormValues(
  transfer: TransferResponseDto
): CreateTransferDto {
  return {
    playerId: transfer.playerId, // For display only, will be excluded from submission
    otherClubName: transfer.otherClubName,
    transferDirection: transfer.transferDirection,
    transferType: transfer.transferType,
    transferStatus: transfer.transferStatus,
    transferDate: transfer.transferDate,
    transferFee: transfer.transferFee ?? undefined,
    agentFee: transfer.agentFee ?? undefined,
    loanEndDate: transfer.loanEndDate ?? undefined,
    notes: transfer.notes,
    createdBy: transfer.createdBy ?? undefined,
  };
}

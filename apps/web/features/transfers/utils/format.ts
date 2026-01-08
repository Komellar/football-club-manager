import { TransferType, TransferStatus, TransferDirection } from "@repo/core";
import {
  transferTypeColors,
  transferStatusColors,
  transferDirectionColors,
} from "../constants/colors";

export function formatTransferType(type: TransferType): string {
  const typeMap: Record<TransferType, string> = {
    [TransferType.SIGNING]: "Signing",
    [TransferType.SALE]: "Sale",
    [TransferType.LOAN]: "Loan Out",
    [TransferType.LOAN_RETURN]: "Loan Return",
    [TransferType.RELEASE]: "Release",
    [TransferType.RETIREMENT]: "Retirement",
  };
  return typeMap[type];
}

export function formatTransferStatus(status: TransferStatus): string {
  const statusMap: Record<TransferStatus, string> = {
    [TransferStatus.PENDING]: "Pending",
    [TransferStatus.COMPLETED]: "Completed",
    [TransferStatus.CANCELLED]: "Cancelled",
  };
  return statusMap[status];
}

export function formatTransferDirection(direction: TransferDirection): string {
  const directionMap: Record<TransferDirection, string> = {
    [TransferDirection.INCOMING]: "Incoming",
    [TransferDirection.OUTGOING]: "Outgoing",
  };
  return directionMap[direction];
}

export function getTransferTypeColor(type: TransferType): string {
  return transferTypeColors[type];
}

export function getTransferStatusColor(status: TransferStatus): string {
  return transferStatusColors[status];
}

export function getTransferDirectionColor(
  direction: TransferDirection
): string {
  return transferDirectionColors[direction];
}

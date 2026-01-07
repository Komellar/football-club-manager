import { TransferType, TransferStatus, TransferDirection } from "@repo/core";

export const transferTypeColors: Record<TransferType, string> = {
  [TransferType.SIGNING]: "bg-green-100 text-green-800 border-green-200",
  [TransferType.SALE]: "bg-blue-100 text-blue-800 border-blue-200",
  [TransferType.LOAN]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [TransferType.LOAN_RETURN]:
    "bg-purple-100 text-purple-800 border-purple-200",
  [TransferType.RELEASE]: "bg-orange-100 text-orange-800 border-orange-200",
  [TransferType.RETIREMENT]: "bg-gray-100 text-gray-800 border-gray-200",
};

export const transferStatusColors: Record<TransferStatus, string> = {
  [TransferStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [TransferStatus.COMPLETED]: "bg-green-100 text-green-800 border-green-200",
  [TransferStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
};

export const transferDirectionColors: Record<TransferDirection, string> = {
  [TransferDirection.INCOMING]: "bg-green-100 text-green-800 border-green-200",
  [TransferDirection.OUTGOING]: "bg-blue-100 text-blue-800 border-blue-200",
};

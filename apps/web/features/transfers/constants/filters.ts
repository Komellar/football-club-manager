import { TransferDirection, TransferStatus, TransferType } from "@repo/core";

export const TRANSFER_DIRECTION_OPTIONS = [
  { value: TransferDirection.INCOMING, labelKey: "directionValues.incoming" },
  { value: TransferDirection.OUTGOING, labelKey: "directionValues.outgoing" },
];

export const TRANSFER_STATUS_OPTIONS = [
  { value: TransferStatus.PENDING, labelKey: "statusValues.pending" },
  { value: TransferStatus.COMPLETED, labelKey: "statusValues.completed" },
  { value: TransferStatus.CANCELLED, labelKey: "statusValues.cancelled" },
];

export const TRANSFER_TYPE_OPTIONS = [
  { value: TransferType.SIGNING, labelKey: "typeValues.signing" },
  { value: TransferType.LOAN, labelKey: "typeValues.loan" },
  { value: TransferType.LOAN_RETURN, labelKey: "typeValues.loanReturn" },
  { value: TransferType.SALE, labelKey: "typeValues.sale" },
  { value: TransferType.RELEASE, labelKey: "typeValues.release" },
  { value: TransferType.RETIREMENT, labelKey: "typeValues.retirement" },
];

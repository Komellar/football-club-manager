import { CreateTransferDto, TransferType, TransferStatus } from "@repo/core";

export const DEFAULT_TRANSFER_FORM_VALUES: Partial<CreateTransferDto> = {};

export const TRANSFER_TYPE_OPTIONS = [
  { value: TransferType.SIGNING, labelKey: "typeValues.signing" },
  { value: TransferType.LOAN, labelKey: "typeValues.loan" },
  { value: TransferType.LOAN_RETURN, labelKey: "typeValues.loanReturn" },
  { value: TransferType.SALE, labelKey: "typeValues.sale" },
  { value: TransferType.RELEASE, labelKey: "typeValues.release" },
  { value: TransferType.RETIREMENT, labelKey: "typeValues.retirement" },
];

export const TRANSFER_STATUS_OPTIONS = [
  { value: TransferStatus.PENDING, labelKey: "statusValues.pending" },
  { value: TransferStatus.COMPLETED, labelKey: "statusValues.completed" },
  { value: TransferStatus.CANCELLED, labelKey: "statusValues.cancelled" },
];

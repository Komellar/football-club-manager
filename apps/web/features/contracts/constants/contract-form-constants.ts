import { ContractType, ContractStatus, CreateContractDto } from "@repo/core";

export const CONTRACT_TYPE_OPTIONS = [
  { value: ContractType.PERMANENT, labelKey: "types.permanent" },
  { value: ContractType.LOAN, labelKey: "types.loan" },
  { value: ContractType.TRIAL, labelKey: "types.trial" },
  { value: ContractType.YOUTH, labelKey: "types.youth" },
  { value: ContractType.PROFESSIONAL, labelKey: "types.professional" },
];

export const CONTRACT_STATUS_OPTIONS = [
  { value: ContractStatus.ACTIVE, labelKey: "statuses.active" },
  { value: ContractStatus.PENDING, labelKey: "statuses.pending" },
  { value: ContractStatus.EXPIRED, labelKey: "statuses.expired" },
  { value: ContractStatus.TERMINATED, labelKey: "statuses.terminated" },
];

export const DEFAULT_CONTRACT_FORM_VALUES: Partial<CreateContractDto> = {};

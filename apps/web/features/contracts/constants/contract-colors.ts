import { ContractStatus, ContractType } from "@repo/core";

export const contractStatusColors: Record<ContractStatus, string> = {
  [ContractStatus.ACTIVE]: "bg-green-100 text-green-800",
  [ContractStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [ContractStatus.EXPIRED]: "bg-red-100 text-red-800",
  [ContractStatus.TERMINATED]: "bg-gray-100 text-gray-800",
};

export const contractTypeColors: Record<ContractType, string> = {
  [ContractType.PERMANENT]: "bg-blue-100 text-blue-800",
  [ContractType.LOAN]: "bg-purple-100 text-purple-800",
  [ContractType.TRIAL]: "bg-orange-100 text-orange-800",
  [ContractType.YOUTH]: "bg-cyan-100 text-cyan-800",
  [ContractType.PROFESSIONAL]: "bg-indigo-100 text-indigo-800",
};

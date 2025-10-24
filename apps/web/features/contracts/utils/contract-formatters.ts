import { ContractType, ContractStatus } from "@repo/core";

export function formatContractType(type: ContractType): string {
  const typeMap: Record<ContractType, string> = {
    [ContractType.PERMANENT]: "Permanent",
    [ContractType.LOAN]: "Loan",
    [ContractType.TRIAL]: "Trial",
    [ContractType.YOUTH]: "Youth",
    [ContractType.PROFESSIONAL]: "Professional",
  };
  return typeMap[type] || type;
}

export function formatContractStatus(status: ContractStatus): string {
  const statusMap: Record<ContractStatus, string> = {
    [ContractStatus.ACTIVE]: "Active",
    [ContractStatus.PENDING]: "Pending",
    [ContractStatus.EXPIRED]: "Expired",
    [ContractStatus.TERMINATED]: "Terminated",
  };
  return statusMap[status] || status;
}

export function calculateRemainingMonths(endDate: Date): number {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  return Math.max(0, diffMonths);
}

export function isContractExpiringSoon(endDate: Date, monthsThreshold = 6): boolean {
  const remainingMonths = calculateRemainingMonths(endDate);
  return remainingMonths <= monthsThreshold && remainingMonths > 0;
}

export function isContractExpired(endDate: Date): boolean {
  const now = new Date();
  const end = new Date(endDate);
  return end < now;
}

export function formatContractDateRange(startDate: Date, endDate: Date): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  
  return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`;
}

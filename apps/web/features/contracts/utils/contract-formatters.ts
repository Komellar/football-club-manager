import { ContractType, ContractStatus } from "@repo/core";

export function formatContractType(type: ContractType): string {
  const typeMap: Record<ContractType, string> = {
    [ContractType.PERMANENT]: "Permanent",
    [ContractType.LOAN]: "Loan",
    [ContractType.YOUTH]: "Youth",
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

export function calculateDurationInMonths(
  startDate: Date,
  endDate: Date
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) return 0;

  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();
  const baseMonths = yearsDiff * 12 + monthsDiff;

  // If there are any days beyond the start day, count as an additional month
  if (end.getDate() > start.getDate()) {
    return baseMonths + 1;
  }

  // If same day or end day is earlier, but we have some duration, count at least 1 month
  return Math.max(1, baseMonths);
}

export function isContractExpiringSoon(
  endDate: Date,
  monthsThreshold = 6
): boolean {
  const remainingMonths = calculateRemainingMonths(endDate);
  return remainingMonths <= monthsThreshold && remainingMonths > 0;
}

export function isContractExpired(endDate: Date): boolean {
  const now = new Date();
  const end = new Date(endDate);
  return end < now;
}

export function formatContractDateRange(
  startDate: Date,
  endDate: Date
): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`;
}

import { ContractResponseDto } from "@repo/core";

export const getCriticalContracts = (
  expiringContracts: ContractResponseDto[]
) => {
  return expiringContracts.filter((contract) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(contract.endDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 14;
  });
};

export const getDaysUntilExpiry = (endDate: Date) => {
  return Math.ceil(
    (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
};

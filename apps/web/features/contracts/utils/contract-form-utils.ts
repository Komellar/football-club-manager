import type { UpdateContractDto, ContractResponseDto } from "@repo/core";

export function transformToFormValues(
  contract: ContractResponseDto
): UpdateContractDto {
  return {
    playerId: contract.playerId,
    contractType: contract.contractType,
    status: contract.status,
    startDate: new Date(contract.startDate),
    endDate: new Date(contract.endDate),
    salary: contract.salary,
    bonuses: contract.bonuses,
    signOnFee: contract.signOnFee,
    agentFee: contract.agentFee,
    releaseClause: contract.releaseClause,
    notes: contract.notes || "",
  };
}

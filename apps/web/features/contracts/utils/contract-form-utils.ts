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
    salary: Number(contract.salary),
    bonuses: Number(contract.bonuses),
    signOnFee: Number(contract.signOnFee),
    agentFee: Number(contract.agentFee),
    releaseClause: Number(contract.releaseClause),
    notes: contract.notes || "",
  };
}

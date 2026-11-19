import { ConflictException } from '@nestjs/common';
import {
  EntityManager,
  In,
  LessThan,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';
import { ContractStatus, TransferDirection, TransferType } from '@repo/core';
import { Contract } from '@/shared/entities/contract.entity';

/** Contracts that bind the player now or will once they start. */
export const BINDING_CONTRACT_STATUSES = [
  ContractStatus.ACTIVE,
  ContractStatus.PENDING,
];

/**
 * A player can hold only one binding contract for any given day. Back-to-back
 * contracts (one ends the day the next starts) are allowed.
 */
export async function assertNoOverlappingContract(
  manager: EntityManager,
  contract: Pick<
    Contract,
    'id' | 'playerId' | 'status' | 'startDate' | 'endDate'
  >,
): Promise<void> {
  if (!BINDING_CONTRACT_STATUSES.includes(contract.status)) return;
  const overlapping = await manager.getRepository(Contract).exists({
    where: {
      ...(contract.id ? { id: Not(contract.id) } : {}),
      playerId: contract.playerId,
      status: In(BINDING_CONTRACT_STATUSES),
      startDate: LessThan(contract.endDate),
      endDate: MoreThan(contract.startDate),
    },
  });
  if (overlapping)
    throw new ConflictException(
      'The player already has an active or pending contract for these dates',
    );
}

/** Whether a completed transfer means the player has left the club for good. */
export function isPermanentDeparture(transfer: {
  transferDirection: TransferDirection;
  transferType: TransferType;
}): boolean {
  return (
    transfer.transferDirection === TransferDirection.OUTGOING &&
    transfer.transferType !== TransferType.LOAN
  );
}

/**
 * Terminates the player's binding contracts on the departure date, so wages
 * stop when the player leaves.
 */
export async function terminateContractsOnDeparture(
  manager: EntityManager,
  playerId: number,
  departureDate: Date,
): Promise<void> {
  const repository = manager.getRepository(Contract);
  const contracts = await repository.find({
    where: {
      playerId,
      status: In(BINDING_CONTRACT_STATUSES),
      endDate: MoreThanOrEqual(departureDate),
    },
  });
  if (!contracts.length) return;
  const date = new Date(new Date(departureDate).toISOString().slice(0, 10));
  for (const contract of contracts) {
    contract.status = ContractStatus.TERMINATED;
    contract.terminatedAt = date;
  }
  await repository.save(contracts);
}

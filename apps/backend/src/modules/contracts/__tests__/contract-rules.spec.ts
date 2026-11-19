import { EntityManager } from 'typeorm';
import { ContractStatus, TransferDirection, TransferType } from '@repo/core';
import { Contract } from '@/shared/entities/contract.entity';
import {
  isPermanentDeparture,
  terminateContractsOnDeparture,
} from '../services/contract-rules';

describe('contract rules on departure', () => {
  it('treats sales, releases and retirements as departures but not loans', () => {
    const out = TransferDirection.OUTGOING;
    expect(
      isPermanentDeparture({
        transferDirection: out,
        transferType: TransferType.SALE,
      }),
    ).toBe(true);
    expect(
      isPermanentDeparture({
        transferDirection: out,
        transferType: TransferType.RETIREMENT,
      }),
    ).toBe(true);
    expect(
      isPermanentDeparture({
        transferDirection: out,
        transferType: TransferType.LOAN,
      }),
    ).toBe(false);
    expect(
      isPermanentDeparture({
        transferDirection: TransferDirection.INCOMING,
        transferType: TransferType.SIGNING,
      }),
    ).toBe(false);
  });

  it('terminates binding contracts on the departure date', async () => {
    const contract = Object.assign(new Contract(), {
      id: 1,
      status: ContractStatus.ACTIVE,
      endDate: new Date('2027-06-30'),
    });
    const repository = {
      find: jest.fn().mockResolvedValue([contract]),
      save: jest.fn(),
    };
    const manager = {
      getRepository: () => repository,
    } as unknown as EntityManager;

    await terminateContractsOnDeparture(
      manager,
      7,
      new Date('2026-08-15T12:00:00Z'),
    );

    expect(repository.save).toHaveBeenCalledWith([
      expect.objectContaining({
        status: ContractStatus.TERMINATED,
        terminatedAt: new Date('2026-08-15'),
      }),
    ]);
  });
});

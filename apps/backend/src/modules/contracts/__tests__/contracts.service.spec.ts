import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Contract } from '@/shared/entities/contract.entity';
import { ContractStatus, ContractType, UpdateContractSchema } from '@repo/core';
import { ContractsService } from '../services/contracts.service';

describe('Contract partial updates', () => {
  const repo = {
    findOneOrFail: jest.fn(),
    save: jest.fn(),
    manager: { transaction: jest.fn() },
  };
  const service = new ContractsService(repo as unknown as Repository<Contract>);
  let contract: Contract;
  beforeEach(() => {
    jest.resetAllMocks();
    contract = Object.assign(new Contract(), {
      id: 1,
      playerId: 2,
      contractType: ContractType.PERMANENT,
      status: ContractStatus.ACTIVE,
      salary: 1000,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
    });
    repo.findOneOrFail.mockResolvedValue(contract);
    repo.save.mockImplementation((value: Contract) => Promise.resolve(value));
    repo.manager.transaction.mockImplementation(
      async (callback: (manager: unknown) => unknown) =>
        await callback({ getRepository: () => repo }),
    );
  });
  it('accepts salary-only updates without changing the player or dates', async () => {
    const result = await service.update(1, { salary: 2000 });
    expect(result).toMatchObject({
      playerId: 2,
      salary: 2000,
      startDate: new Date('2026-01-01'),
    });
  });
  it('rejects a changed player only when one is supplied', async () => {
    await expect(service.update(1, { playerId: 3 })).rejects.toThrow(
      BadRequestException,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });
  it('validates a one-date patch against the stored other date', async () => {
    await expect(
      service.update(1, { startDate: new Date('2027-01-01') }),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.update(1, { endDate: new Date('2025-12-31') }),
    ).rejects.toThrow(BadRequestException);
    expect(repo.save).not.toHaveBeenCalled();
  });
  it('rejects reversed dates in the shared patch schema', () => {
    expect(
      UpdateContractSchema.safeParse({
        startDate: '2026-02-01',
        endDate: '2026-01-01',
      }).success,
    ).toBe(false);
  });
});

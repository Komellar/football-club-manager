import { In, Repository } from 'typeorm';
import { Contract } from '@/shared/entities/contract.entity';
import {
  ContractFinancialService,
  WAGE_BEARING_STATUSES,
} from '../services/contractFinancial.service';
import { dateColumnTransformer } from '@/shared/utils/date-column.transformer';
import { Transfer } from '@/shared/entities/transfer.entity';
import { ContractStatus, TransferType, TransferStatus } from '@repo/core';

describe('Database calendar dates', () => {
  it.each([
    ['2026-10-20', '2027-10-20'],
    [new Date('2026-10-20'), new Date('2027-10-20')],
  ])(
    'counts fees equally for driver strings and Date instances',
    async (startDate, endDate) => {
      const repo = {
        find: jest
          .fn()
          .mockResolvedValue([
            { startDate, endDate, salary: 1000, signOnFee: 200, agentFee: 100 },
          ]),
      };
      const service = new ContractFinancialService(
        repo as unknown as Repository<Contract>,
      );
      expect(
        await service.calculateTotalWages(
          new Date('2026-10-01'),
          new Date('2026-10-31T23:59:59.999Z'),
        ),
      ).toEqual({
        totalWages: 1000,
        totalSignOnFees: 200,
        totalAgentFees: 100,
      });
    },
  );
  it('only charges signed contracts and stops wages at termination', async () => {
    const find = jest.fn().mockResolvedValue([
      {
        status: ContractStatus.TERMINATED,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        terminatedAt: new Date('2026-03-31'),
        salary: 1000,
      },
    ]);
    const service = new ContractFinancialService({
      find,
    } as unknown as Repository<Contract>);
    const { totalWages } = await service.calculateTotalWages(
      new Date('2026-01-01'),
      new Date('2026-12-31T23:59:59.999Z'),
    );
    expect(totalWages).toBe(3000);
    expect(find.mock.calls[0][0].where.status).toEqual(
      In(WAGE_BEARING_STATUSES),
    );
    expect(WAGE_BEARING_STATUSES).not.toContain(ContractStatus.PENDING);
  });
  it('normalizes DATE columns without shifting their UTC calendar day', () => {
    expect(dateColumnTransformer.from('2026-02-28')).toEqual(
      new Date('2026-02-28T00:00:00.000Z'),
    );
    expect(dateColumnTransformer.to(new Date('2026-02-28T23:00:00Z'))).toBe(
      '2026-02-28',
    );
    expect(dateColumnTransformer.from(null)).toBeNull();
  });
  it('treats the loan end day as inclusive and excludes future loans', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-02T22:00:00Z'));
    const transfer = Object.assign(new Transfer(), {
      transferType: TransferType.LOAN,
      transferStatus: TransferStatus.COMPLETED,
      transferDate: new Date('2026-01-01'),
      loanEndDate: new Date('2026-10-02'),
    });
    try {
      expect(transfer.isActiveLoan).toBe(true);
      transfer.transferDate = new Date('2026-10-03');
      expect(transfer.isActiveLoan).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });
});

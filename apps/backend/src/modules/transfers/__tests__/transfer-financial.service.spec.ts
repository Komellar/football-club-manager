import { Repository } from 'typeorm';
import { TransferDirection } from '@repo/core';
import { Transfer } from '@/shared/entities/transfer.entity';
import { TransferFinancialService } from '../services/transferFinancial.service';

describe('TransferFinancialService', () => {
  it('counts agent fees on sales and sums in cents', async () => {
    const repo = {
      find: jest.fn().mockResolvedValue([
        {
          transferDirection: TransferDirection.INCOMING,
          transferFee: 0.1,
          agentFee: 0.2,
        },
        {
          transferDirection: TransferDirection.OUTGOING,
          transferFee: 0.2,
          agentFee: 0.1,
        },
        {
          transferDirection: TransferDirection.OUTGOING,
          transferFee: 0.1,
          agentFee: null,
        },
      ]),
    };
    const service = new TransferFinancialService(
      repo as unknown as Repository<Transfer>,
    );
    expect(
      await service.calculateTotalTransfers(
        new Date('2026-01-01'),
        new Date('2026-12-31'),
      ),
    ).toEqual({
      transferIncome: 0.3,
      transferExpenses: 0.1,
      transferAgentFees: 0.3,
    });
  });
});

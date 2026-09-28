import { FinanceService } from '../services/finance.service';
import { ContractFinancialService } from '../../contracts/services/contractFinancial.service';
import { TransferFinancialService } from '../../transfers/services/transferFinancial.service';
import { SponsorshipFinancialService } from '../../sponsorships/services/sponsorship-financial.service';

describe('FinanceService sponsorship income', () => {
  it('includes scheduled receipts in monthly and total income across a month boundary', async () => {
    const contracts = {
      calculateTotalWages: jest.fn().mockResolvedValue({
        totalWages: 0,
        totalSignOnFees: 0,
        totalAgentFees: 0,
      }),
    } as unknown as ContractFinancialService;
    const transfers = {
      calculateTotalTransfers: jest.fn().mockResolvedValue({
        transferIncome: 0,
        transferExpenses: 0,
        transferAgentFees: 0,
      }),
    } as unknown as TransferFinancialService;
    const sponsorships = {
      calculateScheduledIncome: jest
        .fn()
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(200),
    } as unknown as SponsorshipFinancialService;

    const service = new FinanceService(contracts, transfers, sponsorships);
    const result = await service.getFinancialSummary(
      new Date('2026-01-31'),
      new Date('2026-02-03'),
    );

    expect(result.monthlyData).toEqual([
      { month: '2026-01', income: 100, expenses: 0 },
      { month: '2026-02', income: 200, expenses: 0 },
    ]);
    expect(result.summary.totalIncome).toBe(300);
    expect(result.summary.breakdown.income.sponsorships).toBe(300);
    expect(sponsorships.calculateScheduledIncome).toHaveBeenCalledTimes(2);
  });
});

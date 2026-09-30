import { FinanceService } from '../services/finance.service';
import { ContractFinancialService } from '../../contracts/services/contractFinancial.service';
import { TransferFinancialService } from '../../transfers/services/transferFinancial.service';
import { SponsorshipFinancialService } from '../../sponsorships/services/sponsorship-financial.service';
import { StadiumFinancialService } from '../services/stadium-financial.service';

describe('FinanceService sponsorship income', () => {
  it('includes matchday income, costs, and maintenance in monthly and total figures', async () => {
    const contracts = {
      calculateTotalWages: jest
        .fn()
        .mockResolvedValue({
          totalWages: 0,
          totalSignOnFees: 0,
          totalAgentFees: 0,
        }),
    } as unknown as ContractFinancialService;
    const transfers = {
      calculateTotalTransfers: jest
        .fn()
        .mockResolvedValue({
          transferIncome: 0,
          transferExpenses: 0,
          transferAgentFees: 0,
        }),
    } as unknown as TransferFinancialService;
    const sponsorships = {
      calculateScheduledIncome: jest.fn().mockResolvedValue(0),
    } as unknown as SponsorshipFinancialService;
    const stadium = {
      calculatePeriod: jest
        .fn()
        .mockResolvedValueOnce({
          ticketSales: 120000,
          matchdayCosts: 650,
          stadiumMaintenance: 100,
        })
        .mockResolvedValueOnce({
          ticketSales: 200000,
          matchdayCosts: 750,
          stadiumMaintenance: 200,
        }),
    } as unknown as StadiumFinancialService;
    const result = await new FinanceService(
      contracts,
      transfers,
      sponsorships,
      stadium,
    ).getFinancialSummary(new Date('2026-09-30'), new Date('2026-10-02'));
    expect(result.monthlyData).toEqual([
      { month: '2026-09', income: 120000, expenses: 750 },
      { month: '2026-10', income: 200000, expenses: 950 },
    ]);
    expect(result.summary).toMatchObject({
      totalIncome: 320000,
      totalExpenses: 1700,
      netProfit: 318300,
      breakdown: {
        income: { ticketSales: 320000 },
        expenses: { matchdayCosts: 1400, stadiumMaintenance: 300 },
      },
    });
  });
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

    const stadium = {
      calculatePeriod: jest.fn().mockResolvedValue({
        ticketSales: 0,
        matchdayCosts: 0,
        stadiumMaintenance: 0,
      }),
    } as unknown as StadiumFinancialService;
    const service = new FinanceService(
      contracts,
      transfers,
      sponsorships,
      stadium,
    );
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

import { Injectable } from '@nestjs/common';
import { ContractFinancialService } from '../../contracts/services/contractFinancial.service';
import { TransferFinancialService } from '../../transfers/services/transferFinancial.service';
import { SponsorshipFinancialService } from '../../sponsorships/services/sponsorship-financial.service';
import { StadiumFinancialService } from './stadium-financial.service';
import { sumMoney } from '@/shared/utils/money';
import {
  Finances,
  FinancialSummary,
  MonthlyFinanceData,
  MonthlyFinances,
  MonthlyTotals,
} from '@repo/core';

@Injectable()
export class FinanceService {
  constructor(
    private readonly contractFinancialService: ContractFinancialService,
    private readonly transferFinancialService: TransferFinancialService,
    private readonly sponsorshipFinancialService: SponsorshipFinancialService,
    private readonly stadiumFinancialService: StadiumFinancialService,
  ) {}

  /**
   * Get comprehensive financial data including summary and monthly breakdown.
   * This method is optimized to calculate monthly data first, then derive the summary,
   */
  async getFinancialSummary(
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialSummary> {
    const { monthlyData, totals } = await this.calculateMonthlyData(
      startDate,
      endDate,
    );
    const summary = this.buildSummary(totals, startDate, endDate);

    return {
      summary,
      monthlyData,
    };
  }

  /**
   * Calculate financial data for each month in the date range
   */
  private async calculateMonthlyData(
    startDate: Date,
    endDate: Date,
  ): Promise<{ monthlyData: MonthlyFinanceData[]; totals: MonthlyTotals }> {
    const monthlyData: MonthlyFinanceData[] = [];
    const totals: MonthlyTotals = {
      totalTicketSales: 0,
      totalMatchdayCosts: 0,
      totalStadiumMaintenance: 0,
      totalTransferIncome: 0,
      totalSponsorshipIncome: 0,
      totalWages: 0,
      totalSignOnFees: 0,
      totalContractAgentFees: 0,
      totalTransferExpenses: 0,
      totalTransferAgentFees: 0,
    };

    const currentDate = new Date(
      Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1),
    );

    while (currentDate <= endDate) {
      const { monthStart, effectiveEnd } = this.getMonthDateRange(
        currentDate,
        startDate,
        endDate,
      );

      const monthFinances = await this.fetchMonthFinances(
        monthStart,
        effectiveEnd,
      );

      const monthData = this.createMonthlyDataEntry(currentDate, monthFinances);
      monthlyData.push(monthData);

      this.accumulateTotals(totals, monthFinances);

      // Move to next month
      currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
    }

    return { monthlyData, totals };
  }

  /**
   * Get the start and end date range for a month
   */
  private getMonthDateRange(
    currentDate: Date,
    startDate: Date,
    endDate: Date,
  ): { monthStart: Date; effectiveEnd: Date } {
    const monthStart =
      currentDate < startDate ? startDate : new Date(currentDate);
    const monthEnd = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      ),
    );

    // Don't go beyond the end date
    const effectiveEnd = monthEnd > endDate ? endDate : monthEnd;

    return { monthStart, effectiveEnd };
  }

  /**
   * Fetch financial data for a given period
   */
  private async fetchMonthFinances(
    monthStart: Date,
    effectiveEnd: Date,
  ): Promise<MonthlyFinances> {
    const {
      totalWages: monthWages,
      totalSignOnFees: monthSignOnFees,
      totalAgentFees: monthContractAgentFees,
    } = await this.contractFinancialService.calculateTotalWages(
      monthStart,
      effectiveEnd,
    );

    const {
      transferIncome: monthTransferIncome,
      transferExpenses: monthTransferExpenses,
      transferAgentFees: monthTransferAgentFees,
    } = await this.transferFinancialService.calculateTotalTransfers(
      monthStart,
      effectiveEnd,
    );

    const monthSponsorshipIncome =
      await this.sponsorshipFinancialService.calculateScheduledIncome(
        monthStart,
        effectiveEnd,
      );

    const stadium = await this.stadiumFinancialService.calculatePeriod(
      monthStart,
      effectiveEnd,
    );
    return {
      monthTicketSales: stadium.ticketSales,
      monthMatchdayCosts: stadium.matchdayCosts,
      monthStadiumMaintenance: stadium.stadiumMaintenance,
      monthWages,
      monthSignOnFees,
      monthContractAgentFees,
      monthTransferIncome,
      monthSponsorshipIncome,
      monthTransferExpenses,
      monthTransferAgentFees,
    };
  }

  /**
   * Create a monthly data entry from financial data
   */
  private createMonthlyDataEntry(
    currentDate: Date,
    finances: MonthlyFinances,
  ): MonthlyFinanceData {
    const income = sumMoney(
      finances.monthTransferIncome,
      finances.monthSponsorshipIncome,
      finances.monthTicketSales,
    );
    const expenses = sumMoney(
      finances.monthWages,
      finances.monthSignOnFees,
      finances.monthContractAgentFees,
      finances.monthTransferExpenses,
      finances.monthTransferAgentFees,
      finances.monthMatchdayCosts,
      finances.monthStadiumMaintenance,
    );

    return {
      month: `${currentDate.getUTCFullYear()}-${String(currentDate.getUTCMonth() + 1).padStart(2, '0')}`,
      income,
      expenses,
    };
  }

  /**
   * Accumulate monthly totals into running totals
   */
  private accumulateTotals(
    totals: MonthlyTotals,
    finances: MonthlyFinances,
  ): void {
    const add = (key: keyof MonthlyTotals, value: number) => {
      totals[key] = sumMoney(totals[key], value);
    };
    add('totalTicketSales', finances.monthTicketSales);
    add('totalMatchdayCosts', finances.monthMatchdayCosts);
    add('totalStadiumMaintenance', finances.monthStadiumMaintenance);
    add('totalTransferIncome', finances.monthTransferIncome);
    add('totalSponsorshipIncome', finances.monthSponsorshipIncome);
    add('totalWages', finances.monthWages);
    add('totalSignOnFees', finances.monthSignOnFees);
    add('totalContractAgentFees', finances.monthContractAgentFees);
    add('totalTransferExpenses', finances.monthTransferExpenses);
    add('totalTransferAgentFees', finances.monthTransferAgentFees);
  }

  /**
   * Build financial summary from accumulated totals
   */
  private buildSummary(
    totals: MonthlyTotals,
    startDate: Date,
    endDate: Date,
  ): Finances {
    const totalIncome = sumMoney(
      totals.totalTransferIncome,
      totals.totalSponsorshipIncome,
      totals.totalTicketSales,
    );
    const totalExpenses = sumMoney(
      totals.totalWages,
      totals.totalTransferExpenses,
      totals.totalContractAgentFees,
      totals.totalTransferAgentFees,
      totals.totalSignOnFees,
      totals.totalMatchdayCosts,
      totals.totalStadiumMaintenance,
    );

    return {
      totalIncome,
      totalExpenses,
      netProfit: sumMoney(totalIncome, -totalExpenses),
      period: {
        startDate,
        endDate,
      },
      breakdown: {
        income: {
          transfers: totals.totalTransferIncome,
          sponsorships: totals.totalSponsorshipIncome,
          ticketSales: totals.totalTicketSales,
        },
        expenses: {
          wages: totals.totalWages,
          transferFees: totals.totalTransferExpenses,
          agentFees: sumMoney(
            totals.totalContractAgentFees,
            totals.totalTransferAgentFees,
          ),
          stadiumMaintenance: totals.totalStadiumMaintenance,
          matchdayCosts: totals.totalMatchdayCosts,
        },
      },
    };
  }
}

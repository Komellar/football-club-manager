import { Injectable } from '@nestjs/common';
import { ContractFinancialService } from '../../contracts/services/contractFinancial.service';
import { TransferFinancialService } from '../../transfers/services/transferFinancial.service';
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
      totalTransferIncome: 0,
      totalWages: 0,
      totalSignOnFees: 0,
      totalContractAgentFees: 0,
      totalTransferExpenses: 0,
      totalTransferAgentFees: 0,
    };

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const { monthStart, effectiveEnd } = this.getMonthDateRange(
        currentDate,
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
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return { monthlyData, totals };
  }

  /**
   * Get the start and end date range for a month
   */
  private getMonthDateRange(
    currentDate: Date,
    endDate: Date,
  ): { monthStart: Date; effectiveEnd: Date } {
    const monthStart = new Date(currentDate);
    const monthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Don't go beyond the end date
    const effectiveEnd = monthEnd > endDate ? endDate : monthEnd;

    return { monthStart, effectiveEnd };
  }

  /**
   * Fetch financial data from contracts and transfers for a given period
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

    return {
      monthWages,
      monthSignOnFees,
      monthContractAgentFees,
      monthTransferIncome,
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
    const income = finances.monthTransferIncome; // TODO: + sponsorships, tickets
    const expenses =
      finances.monthWages +
      finances.monthSignOnFees +
      finances.monthContractAgentFees +
      finances.monthTransferExpenses +
      finances.monthTransferAgentFees;

    return {
      month: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
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
    totals.totalTransferIncome += finances.monthTransferIncome;
    totals.totalWages += finances.monthWages;
    totals.totalSignOnFees += finances.monthSignOnFees;
    totals.totalContractAgentFees += finances.monthContractAgentFees;
    totals.totalTransferExpenses += finances.monthTransferExpenses;
    totals.totalTransferAgentFees += finances.monthTransferAgentFees;
  }

  /**
   * Build financial summary from accumulated totals
   */
  private buildSummary(
    totals: MonthlyTotals,
    startDate: Date,
    endDate: Date,
  ): Finances {
    const totalIncome = totals.totalTransferIncome; // TODO: + sponsorships, tickets
    const totalExpenses =
      totals.totalWages +
      totals.totalTransferExpenses +
      totals.totalContractAgentFees +
      totals.totalTransferAgentFees +
      totals.totalSignOnFees;

    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      period: {
        startDate,
        endDate,
      },
      breakdown: {
        income: {
          transfers: totals.totalTransferIncome,
          sponsorships: 0, // TODO
          ticketSales: 0, // TODO
        },
        expenses: {
          wages: totals.totalWages,
          transferFees: totals.totalTransferExpenses,
          agentFees:
            totals.totalContractAgentFees + totals.totalTransferAgentFees,
          stadiumMaintenance: 0, // TODO
        },
      },
    };
  }
}

import { Injectable } from '@nestjs/common';
import { ContractFinancialService } from '../../contracts/services/contractFinancial.service';
import { TransferFinancialService } from '../../transfers/services/transferFinancial.service';
import { SponsorshipFinancialService } from '../../sponsorships/services/sponsorship-financial.service';
import { StadiumFinancialService } from './stadium-financial.service';
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
    const income =
      finances.monthTransferIncome +
      finances.monthSponsorshipIncome +
      finances.monthTicketSales;
    const expenses =
      finances.monthWages +
      finances.monthSignOnFees +
      finances.monthContractAgentFees +
      finances.monthTransferExpenses +
      finances.monthTransferAgentFees +
      finances.monthMatchdayCosts +
      finances.monthStadiumMaintenance;

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
    totals.totalTicketSales += finances.monthTicketSales;
    totals.totalMatchdayCosts += finances.monthMatchdayCosts;
    totals.totalStadiumMaintenance += finances.monthStadiumMaintenance;
    totals.totalTransferIncome += finances.monthTransferIncome;
    totals.totalSponsorshipIncome += finances.monthSponsorshipIncome;
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
    const totalIncome =
      totals.totalTransferIncome +
      totals.totalSponsorshipIncome +
      totals.totalTicketSales;
    const totalExpenses =
      totals.totalWages +
      totals.totalTransferExpenses +
      totals.totalContractAgentFees +
      totals.totalTransferAgentFees +
      totals.totalSignOnFees +
      totals.totalMatchdayCosts +
      totals.totalStadiumMaintenance;

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
          sponsorships: totals.totalSponsorshipIncome,
          ticketSales: totals.totalTicketSales,
        },
        expenses: {
          wages: totals.totalWages,
          transferFees: totals.totalTransferExpenses,
          agentFees:
            totals.totalContractAgentFees + totals.totalTransferAgentFees,
          stadiumMaintenance: totals.totalStadiumMaintenance,
          matchdayCosts: totals.totalMatchdayCosts,
        },
      },
    };
  }
}

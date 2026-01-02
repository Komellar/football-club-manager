import { Injectable } from '@nestjs/common';
import { ContractFinancialService } from '../../contracts/services/contractFinancial.service';
import { TransferFinancialService } from '../../transfers/services/transferFinancial.service';
import { FinancialSummary } from '@repo/core';

@Injectable()
export class FinanceService {
  constructor(
    private readonly contractFinancialService: ContractFinancialService,
    private readonly transferFinancialService: TransferFinancialService,
  ) {}

  async getFinancialSummary(
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialSummary> {
    const {
      totalWages,
      totalSignOnFees,
      totalAgentFees: totalContractAgentFees,
    } = await this.contractFinancialService.calculateTotalWages(
      startDate,
      endDate,
    );

    const { transferIncome, transferExpenses, transferAgentFees } =
      await this.transferFinancialService.calculateTotalTransfers(
        startDate,
        endDate,
      );

    const totalIncome = transferIncome; // TODO // + sponsorships, tickets
    const totalExpenses =
      totalWages +
      transferExpenses +
      totalContractAgentFees +
      transferAgentFees +
      totalSignOnFees;

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
          transfers: transferIncome,
          sponsorships: 0, // TODO
          ticketSales: 0, // TODO
        },
        expenses: {
          wages: totalWages,
          transferFees: transferExpenses,
          agentFees: totalContractAgentFees + transferAgentFees, // Combined agent fees
          stadiumMaintenance: 0, // TODO
        },
      },
    };
  }
}

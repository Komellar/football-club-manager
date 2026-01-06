import { Finances, MonthlyFinanceData } from "../schemas";

export interface FinancialSummary {
  summary: Finances;
  monthlyData: MonthlyFinanceData[];
}

export interface MonthlyTotals {
  totalTransferIncome: number;
  totalWages: number;
  totalSignOnFees: number;
  totalContractAgentFees: number;
  totalTransferExpenses: number;
  totalTransferAgentFees: number;
}

export interface MonthlyFinances {
  monthWages: number;
  monthSignOnFees: number;
  monthContractAgentFees: number;
  monthTransferIncome: number;
  monthTransferExpenses: number;
  monthTransferAgentFees: number;
}

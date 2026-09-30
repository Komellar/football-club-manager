import { Finances, MonthlyFinanceData } from "../schemas";

export interface FinancialSummary {
  summary: Finances;
  monthlyData: MonthlyFinanceData[];
}

export interface SponsorshipPayment {
  date: string; // YYYY-MM-DD
  amount: number;
}

export interface MonthlyTotals {
  totalTicketSales: number;
  totalMatchdayCosts: number;
  totalStadiumMaintenance: number;
  totalTransferIncome: number;
  totalSponsorshipIncome: number;
  totalWages: number;
  totalSignOnFees: number;
  totalContractAgentFees: number;
  totalTransferExpenses: number;
  totalTransferAgentFees: number;
}

export interface MonthlyFinances {
  monthTicketSales: number;
  monthMatchdayCosts: number;
  monthStadiumMaintenance: number;
  monthWages: number;
  monthSignOnFees: number;
  monthContractAgentFees: number;
  monthTransferIncome: number;
  monthSponsorshipIncome: number;
  monthTransferExpenses: number;
  monthTransferAgentFees: number;
}

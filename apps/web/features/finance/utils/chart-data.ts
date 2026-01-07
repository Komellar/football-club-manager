import { FinancialSummary } from "@repo/core";

export const prepareIncomeData = (data: FinancialSummary) => {
  const { transfers, sponsorships, ticketSales } =
    data.summary.breakdown.income;

  return Object.fromEntries(
    Object.entries({
      transfers,
      sponsorships: sponsorships || 0,
      ticketSales: ticketSales || 0,
    }).filter(([, value]) => value && value > 0)
  );
};

export const prepareExpenseData = (
  data: FinancialSummary
): Record<string, number> => {
  const { wages, transferFees, agentFees, stadiumMaintenance } =
    data.summary.breakdown.expenses;

  return Object.fromEntries(
    Object.entries({
      wages,
      transferFees,
      agentFees,
      stadiumMaintenance: stadiumMaintenance || 0,
    }).filter(([, value]) => value && value > 0)
  );
};

export const prepareOverviewData = (data: FinancialSummary) => {
  return data.monthlyData.map((item) => ({
    month: item.month,
    income: item.income,
    expenses: item.expenses,
  }));
};

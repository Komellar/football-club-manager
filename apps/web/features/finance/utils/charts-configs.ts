import { ChartConfig } from "@/components/ui/chart";

export const overviewChartConfig = {
  income: {
    label: "income",
    color: "var(--chart-1)",
  },
  expenses: {
    label: "expenses",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const expenseBreakdownChartConfig = {
  wages: {
    label: "Wages",
    color: "var(--chart-1)",
  },
  transferFees: {
    label: "Transfer Fees",
    color: "var(--chart-2)",
  },
  agentFees: {
    label: "Agent Fees",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export const incomeBreakdownChartConfig = {
  sponsorships: {
    label: "Sponsorships",
    color: "var(--chart-1)",
  },
  ticketSales: {
    label: "Ticket Sales",
    color: "var(--chart-2)",
  },
  transfers: {
    label: "Transfers",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

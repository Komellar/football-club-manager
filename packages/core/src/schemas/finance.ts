import { z } from "zod";

export const FinancesSchema = z.object({
  totalIncome: z.number(),
  totalExpenses: z.number(),
  netProfit: z.number(),
  period: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
  breakdown: z.object({
    income: z.object({
      transfers: z.number(),
      sponsorships: z.number().optional(), // Future
      ticketSales: z.number().optional(), // Future
    }),
    expenses: z.object({
      wages: z.number(),
      transferFees: z.number(),
      agentFees: z.number(),
      stadiumMaintenance: z.number().optional(), // Future
    }),
  }),
});

export type Finances = z.infer<typeof FinancesSchema>;

export const MonthlyFinanceDataSchema = z.object({
  month: z.string(), // Format: "YYYY-MM"
  income: z.number(),
  expenses: z.number(),
});

export type MonthlyFinanceData = z.infer<typeof MonthlyFinanceDataSchema>;

export const FinancePeriodQuerySchema = z.object({
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
});

export type FinancePeriodQuery = z.infer<typeof FinancePeriodQuerySchema>;

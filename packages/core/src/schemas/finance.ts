import { z } from "zod";

export const FinancialSummarySchema = z.object({
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

export type FinancialSummary = z.infer<typeof FinancialSummarySchema>;

export const FinancePeriodQuerySchema = z.object({
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
});

export type FinancePeriodQuery = z.infer<typeof FinancePeriodQuerySchema>;

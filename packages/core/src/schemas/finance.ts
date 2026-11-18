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
      ticketSales: z.number().optional(),
    }),
    expenses: z.object({
      wages: z.number(),
      transferFees: z.number(),
      agentFees: z.number(),
      stadiumMaintenance: z.number().optional(),
      matchdayCosts: z.number().optional(),
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

/** Each month in the range costs several queries, so the span is capped. */
export const FINANCE_MAX_RANGE_YEARS = 10;

export const FinancePeriodQuerySchema = z
  .object({
    startDate: z.coerce.date<string>("startDate must be a valid date"),
    endDate: z.coerce.date<string>("endDate must be a valid date"),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "startDate must be before or equal to endDate",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      const limit = new Date(data.startDate);
      limit.setUTCFullYear(limit.getUTCFullYear() + FINANCE_MAX_RANGE_YEARS);
      return data.endDate <= limit;
    },
    {
      message: `The period can span at most ${FINANCE_MAX_RANGE_YEARS} years`,
      path: ["endDate"],
    },
  );

export type FinancePeriodQuery = z.infer<typeof FinancePeriodQuerySchema>;

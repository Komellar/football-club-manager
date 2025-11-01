import { z } from "zod";
import { createPaginationResponseSchema } from "../../utils/schema-utils";
import { PlayerResponseSchema } from "../player";
import { ContractSchema } from "./contract";

export const ContractResponseSchema = ContractSchema.extend({
  player: PlayerResponseSchema.optional(),
});

export const PaginatedContractResponseSchema = createPaginationResponseSchema(
  ContractResponseSchema
);

export const ContractValueCalculationSchema = z.object({
  totalValue: z.number(),
  salaryValue: z.number(),
  bonusesValue: z.number(),
  signOnFeeValue: z.number(),
  agentFeeValue: z.number(),
  remainingValue: z.number(),
  remainingMonths: z.number(),
});

export const ContractFinancialSummarySchema = z.object({
  totalActiveValue: z.number(),
  totalMonthlyCommitment: z.number(),
  upcomingExpiries: z.object({
    count: z.number(),
    value: z.number(),
  }),
  averageSalary: z.number(),
  totalContracts: z.number(),
  contractsByType: z.record(z.string(), z.number()),
});

export type ContractResponse = z.infer<typeof ContractResponseSchema>;
export type PaginatedContractResponseDto = z.infer<
  typeof PaginatedContractResponseSchema
>;
export type ContractValueCalculation = z.infer<
  typeof ContractValueCalculationSchema
>;
export type ContractFinancialSummary = z.infer<
  typeof ContractFinancialSummarySchema
>;

export type ContractResponseDto = ContractResponse;

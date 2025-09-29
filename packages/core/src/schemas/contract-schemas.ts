import { z } from "zod";
import { ContractStatus, ContractType } from "../enums";
import { createPaginationResultSchema } from "./shared-schemas";

export const ContractSchema = z.object({
  id: z.number().int().positive(),
  playerId: z.number().int().positive(),
  contractType: z.enum([
    ContractType.PERMANENT,
    ContractType.LOAN,
    ContractType.TRIAL,
    ContractType.YOUTH,
    ContractType.PROFESSIONAL,
  ]),
  status: z.enum([
    ContractStatus.ACTIVE,
    ContractStatus.EXPIRED,
    ContractStatus.TERMINATED,
    ContractStatus.PENDING,
  ]),
  startDate: z.iso.datetime().or(z.date()),
  endDate: z.iso.datetime().or(z.date()),
  salary: z.number().positive(),
  currency: z.string().length(3).default("EUR"),
  bonuses: z.number().min(0).optional(),
  signOnFee: z.number().min(0).optional(),
  releaseClause: z.number().positive().optional(),
  agentFee: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
  createdAt: z.iso.datetime().or(z.date()),
  updatedAt: z.iso.datetime().or(z.date()),
});

export const CreateContractSchema = ContractSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).refine(
  (data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate > startDate;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export const UpdateContractSchema = CreateContractSchema.partial();

export const ContractQuerySchema = z.object({
  playerId: z.number().int().positive().optional(),
  status: z
    .enum([
      ContractStatus.ACTIVE,
      ContractStatus.EXPIRED,
      ContractStatus.TERMINATED,
      ContractStatus.PENDING,
    ])
    .optional(),
  contractType: z
    .enum([
      ContractType.PERMANENT,
      ContractType.LOAN,
      ContractType.TRIAL,
      ContractType.YOUTH,
      ContractType.PROFESSIONAL,
    ])
    .optional(),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z
    .enum(["startDate", "endDate", "salary", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
});

export const ContractResponseSchema = ContractSchema.extend({
  player: z
    .object({
      id: z.number(),
      name: z.string(),
      position: z.string(),
      jerseyNumber: z.number().optional(),
    })
    .optional(),
});

export const PaginatedContractResponseSchema = createPaginationResultSchema(
  ContractResponseSchema
);

// Contract renewal schemas
export const ContractRenewalSchema = z.object({
  endDate: z.coerce.date(),
  salary: z.number().positive().optional(),
  bonuses: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
});

export const ContractNewRenewalSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    salary: z.number().positive().optional(),
    bonuses: z.number().min(0).optional(),
    signOnFee: z.number().min(0).optional(),
    releaseClause: z.number().positive().optional(),
    agentFee: z.number().min(0).optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) => {
      return data.endDate > data.startDate;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

// Contract value calculation response schema
export const ContractValueCalculationSchema = z.object({
  totalValue: z.number(),
  salaryValue: z.number(),
  bonusesValue: z.number(),
  signOnFeeValue: z.number(),
  agentFeeValue: z.number(),
  remainingValue: z.number(),
  remainingMonths: z.number(),
});

// Contract expiry report response schema
export const ContractExpiryReportSchema = z.object({
  expired: z.array(ContractResponseSchema),
  expiringSoon: z.array(ContractResponseSchema),
  expiringLater: z.array(ContractResponseSchema),
  active: z.number(),
  total: z.number(),
});

// Financial summary response schema
export const ContractFinancialSummarySchema = z.object({
  totalActiveValue: z.number(),
  totalMonthlyCommitment: z.number(),
  upcomingExpiries: z.object({
    count: z.number(),
    value: z.number(),
  }),
  averageSalary: z.number(),
  totalContracts: z.number(),
  contractsByType: z.record(
    z.enum([
      ContractType.PERMANENT,
      ContractType.LOAN,
      ContractType.TRIAL,
      ContractType.YOUTH,
      ContractType.PROFESSIONAL,
    ]),
    z.number()
  ),
});

// Query schemas for contract expiry endpoints
export const ExpiryQuerySchema = z.object({
  days: z.number().int().min(1).optional(),
});

export const ReportQuerySchema = z.object({
  days: z.number().int().min(1).optional(),
});

export type Contract = z.infer<typeof ContractSchema>;
export type CreateContract = z.infer<typeof CreateContractSchema>;
export type UpdateContract = z.infer<typeof UpdateContractSchema>;
export type ContractQuery = z.infer<typeof ContractQuerySchema>;
export type ContractResponse = z.infer<typeof ContractResponseSchema>;
export type PaginatedContractResponseDto = z.infer<
  typeof PaginatedContractResponseSchema
>;
export type ContractRenewal = z.infer<typeof ContractRenewalSchema>;
export type ContractNewRenewal = z.infer<typeof ContractNewRenewalSchema>;
export type ContractValueCalculation = z.infer<
  typeof ContractValueCalculationSchema
>;
export type ContractExpiryReport = z.infer<typeof ContractExpiryReportSchema>;
export type ContractFinancialSummary = z.infer<
  typeof ContractFinancialSummarySchema
>;

export type CreateContractDto = CreateContract;
export type UpdateContractDto = UpdateContract;
export type ContractQueryDto = ContractQuery;
export type ContractResponseDto = ContractResponse;
export type ContractRenewalDto = ContractRenewal;
export type ContractNewRenewalDto = ContractNewRenewal;

// Additional query types
export type ExpiryQuery = z.infer<typeof ExpiryQuerySchema>;
export type ReportQuery = z.infer<typeof ReportQuerySchema>;
export type ExpiryQueryDto = ExpiryQuery;
export type ReportQueryDto = ReportQuery;

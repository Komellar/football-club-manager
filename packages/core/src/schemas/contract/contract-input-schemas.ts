import { z } from "zod";
import { ContractStatus, ContractType } from "../../enums";

export const ContractSchema = z.object({
  id: z.number().int().positive(),
  playerId: z.number().int().positive(),
  contractType: z.enum(ContractType),
  status: z.enum(ContractStatus),
  startDate: z.coerce.date<Date>("Invalid date"),
  endDate: z.coerce.date<Date>("Invalid date"),
  salary: z.number().positive(),
  bonuses: z.number().min(0).optional(),
  signOnFee: z.number().min(0).optional(),
  releaseClause: z.number().positive().optional(),
  agentFee: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
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

export type Contract = z.infer<typeof ContractSchema>;
export type CreateContract = z.infer<typeof CreateContractSchema>;
export type UpdateContract = z.infer<typeof UpdateContractSchema>;
export type ContractRenewal = z.infer<typeof ContractRenewalSchema>;
export type ContractNewRenewal = z.infer<typeof ContractNewRenewalSchema>;

export type CreateContractDto = CreateContract;
export type UpdateContractDto = UpdateContract;
export type ContractRenewalDto = ContractRenewal;
export type ContractNewRenewalDto = ContractNewRenewal;

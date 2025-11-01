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
  bonuses: z.number().min(0).optional().nullable(),
  signOnFee: z.number().min(0).optional().nullable(),
  releaseClause: z.number().positive().optional().nullable(),
  agentFee: z.number().min(0).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

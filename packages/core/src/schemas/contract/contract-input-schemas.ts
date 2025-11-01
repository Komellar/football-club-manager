import { z } from "zod";
import { ContractSchema } from "./contract";

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

export type CreateContract = z.infer<typeof CreateContractSchema>;
export type UpdateContract = z.infer<typeof UpdateContractSchema>;

export type CreateContractDto = CreateContract;
export type UpdateContractDto = UpdateContract;

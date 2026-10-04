import { z } from "zod";
import { ContractSchema } from "./contract";

const ContractInputSchema = ContractSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateContractSchema = ContractInputSchema.refine(
  (data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate > startDate;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  },
);

export const UpdateContractSchema = ContractInputSchema.partial().refine(
  (data) => !data.startDate || !data.endDate || data.endDate > data.startDate,
  { message: "End date must be after start date", path: ["endDate"] },
);

export type CreateContract = z.infer<typeof CreateContractSchema>;
export type UpdateContract = z.infer<typeof UpdateContractSchema>;

export type CreateContractDto = CreateContract;
export type UpdateContractDto = UpdateContract;

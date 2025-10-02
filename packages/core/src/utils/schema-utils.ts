import { z } from "zod";
import { PaginationMetaSchema } from "../schemas/list/pagination-schemas";

export function createPaginationResponseSchema<T extends z.ZodTypeAny>(
  dataSchema: T
) {
  return z.object({
    data: z.array(dataSchema),
    pagination: PaginationMetaSchema,
  });
}

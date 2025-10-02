import { z } from "zod";

export const PaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export function createPaginationResultSchema<T extends z.ZodTypeAny>(
  dataSchema: T
) {
  return z.object({
    data: z.array(dataSchema),
    pagination: PaginationMetaSchema,
  });
}

export type PaginationResult<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export const BasePaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
});

export type BasePagination = z.infer<typeof BasePaginationSchema>;

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive("ID must be a positive integer"),
});

export type IdParam = z.infer<typeof IdParamSchema>;

export const UuidParamSchema = z.object({
  id: z.uuid("Invalid UUID format"),
});

export type UuidParam = z.infer<typeof UuidParamSchema>;

export const DateRangeQuerySchema = z
  .object({
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
      }
      return true;
    },
    {
      message: "dateFrom must be before or equal to dateTo",
      path: ["dateTo"],
    }
  );

export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;

export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.unknown().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

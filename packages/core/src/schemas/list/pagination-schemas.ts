import { z } from "zod";

export const ListQueryParamsSchema = z.object({
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(100).default(10).optional(),
  search: z.string().trim().optional(),
});

export const PaginationResultSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const PaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export type ListQueryParams = z.infer<typeof ListQueryParamsSchema>;

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export type PaginationResult<T> = {
  data: T[];
  pagination: PaginationMeta;
};

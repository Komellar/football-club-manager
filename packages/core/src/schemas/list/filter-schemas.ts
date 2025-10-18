import { z } from "zod";
import { CompareOperator, FilterMode } from "../../enums";

export const CompareOperatorSchema = z.enum(CompareOperator);

export const FilterModeSchema = z.enum(FilterMode);

export const FilterSearchOptionsSchema = z.object({
  searchFields: z.array(z.string()).min(1),
  searchMode: FilterModeSchema.default(FilterMode.PARTIAL).optional(),
});

export const FilterOptionsSchema = z.object({
  ignoredFilters: z.array(z.string()).optional(),
  filterModes: z.record(z.string(), FilterModeSchema).optional(),
  defaultFilterMode: FilterModeSchema.optional(),
  searchOptions: FilterSearchOptionsSchema.optional(),
});

export const ComparableSchema = z.record(
  CompareOperatorSchema,
  z.union([z.unknown(), z.array(z.unknown())])
);

export type SearchOptions = z.infer<typeof FilterSearchOptionsSchema>;
export type FilterOptions = z.infer<typeof FilterOptionsSchema>;
export type Comparable<T> = {
  [K in CompareOperator]?: T | T[];
};

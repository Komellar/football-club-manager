import { SortOrder, SortParams, SortParamsSchema } from "@repo/core";
import qs from "qs";

export function parseSortFromQuery<T extends string = string>(
  query: string,
  defaultSort: { by: T; order: SortOrder }
): { by: T; order: SortOrder } {
  const parsed = qs.parse(query);
  const sortFromUrl = parsed.sort as SortParams;
  const { data, success } = SortParamsSchema.safeParse(sortFromUrl);
  if (success && data) {
    return {
      by: data.by as T,
      order: data.order as SortOrder,
    };
  }
  return defaultSort;
}

export function updateQueryWithSort<T extends string = string>(
  current: URLSearchParams,
  column: T,
  order: SortOrder
): string {
  current.set("sort[by]", column);
  current.set("sort[order]", order);
  current.delete("page"); // Reset to first page on sort change
  return current.toString();
}

export function clearSortParams(current: URLSearchParams): string {
  current.delete("sort[by]");
  current.delete("sort[order]");
  current.delete("page");
  return current.toString();
}

export function isSorted<T extends string = string>(
  sort: { by: T; order: SortOrder },
  column: T
): SortOrder | undefined {
  return sort.by === column ? sort.order : undefined;
}

"use client";

import { useCallback, useMemo, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SortOrder, SortParams, SortParamsSchema } from "@repo/core";
import qs from "qs";

export interface SortState<T extends string = string> {
  by: T;
  order: SortOrder;
}

export interface UseTableSortOptions<T extends string> {
  defaultSort: SortState<T>;
}

export interface UseTableSortReturn<T extends string> {
  sort: SortState<T>;
  toggleSort: (column: T) => void;
  isSorted: (column: T) => SortOrder | undefined;
}

export function useTableSort<T extends string>({
  defaultSort,
}: UseTableSortOptions<T>): UseTableSortReturn<T> {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Parse sort from URL
  const urlSort = useMemo(() => {
    const parsed = qs.parse(searchParams.toString());
    const sortFromUrl = parsed.sort as SortParams;

    const { data, success } = SortParamsSchema.safeParse(sortFromUrl);

    if (success && data) {
      return {
        by: data.by as T,
        order: data.order as SortOrder,
      };
    }

    return defaultSort;
  }, [searchParams, defaultSort]);

  const toggleSort = useCallback(
    (column: T) => {
      startTransition(() => {
        const current = new URLSearchParams(searchParams.toString());
        const isSameColumn = urlSort.by === column;
        const isAsc = urlSort.order === SortOrder.ASC;

        if (isSameColumn && isAsc) {
          current.set("sort[by]", column);
          current.set("sort[order]", SortOrder.DESC);
        } else if (isSameColumn) {
          current.delete("sort[by]");
          current.delete("sort[order]");
        } else {
          current.set("sort[by]", column);
          current.set("sort[order]", SortOrder.ASC);
        }

        const query = current.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
      });
    },
    [urlSort, searchParams, router, pathname]
  );

  const isSorted = useCallback(
    (column: T): SortOrder | undefined => {
      if (urlSort.by === column) {
        return urlSort.order;
      }
      return undefined;
    },
    [urlSort]
  );

  return {
    sort: urlSort,
    toggleSort,
    isSorted,
  };
}

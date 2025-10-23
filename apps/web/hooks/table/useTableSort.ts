"use client";

import { useCallback, useMemo, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SortOrder } from "@repo/core";
import {
  parseSortFromQuery,
  updateQueryWithSort,
  clearSortParams,
  isSorted as isSortedUtil,
} from "@/utils/table/sort";

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
    return parseSortFromQuery<T>(searchParams.toString(), defaultSort);
  }, [searchParams, defaultSort]);

  const toggleSort = useCallback(
    (column: T) => {
      startTransition(() => {
        const current = new URLSearchParams(searchParams.toString());
        const isSameColumn = urlSort.by === column;
        const isAsc = urlSort.order === SortOrder.ASC;
        let query: string;
        if (isSameColumn && isAsc) {
          query = updateQueryWithSort(current, column, SortOrder.DESC);
        } else if (isSameColumn) {
          query = clearSortParams(current);
        } else {
          query = updateQueryWithSort(current, column, SortOrder.ASC);
        }
        router.push(query ? `${pathname}?${query}` : pathname);
      });
    },
    [urlSort, searchParams, router, pathname]
  );

  const isSorted = useCallback(
    (column: T): SortOrder | undefined => {
      return isSortedUtil<T>(urlSort, column);
    },
    [urlSort]
  );

  return {
    sort: urlSort,
    toggleSort,
    isSorted,
  };
}

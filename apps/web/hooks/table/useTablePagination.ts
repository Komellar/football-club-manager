"use client";

import { useCallback, useMemo, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  parsePaginationFromQuery,
  updateQueryWithPagination,
} from "@/utils/table/pagination";

export interface PaginationState {
  page: number;
  limit: number;
}

export interface UseTablePaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
}

export interface UseTablePaginationReturn {
  pagination: PaginationState;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setLimit: (limit: number) => void;
  resetPage: () => void;
  isPending: boolean;
}

export function useTablePagination({
  defaultPage = 1,
  defaultLimit = 10,
}: UseTablePaginationOptions = {}): UseTablePaginationReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse pagination from URL
  const pagination = useMemo(() => {
    const parsed = parsePaginationFromQuery(searchParams.toString());
    return {
      page: parsed.page || defaultPage,
      limit: parsed.limit || defaultLimit,
    };
  }, [searchParams, defaultPage, defaultLimit]);

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1) return;

      startTransition(() => {
        const current = new URLSearchParams(searchParams.toString());
        const query = updateQueryWithPagination(
          current,
          page,
          pagination.limit
        );

        router.push(`${pathname}?${query}`);
      });
    },
    [searchParams, router, pathname, pagination.limit]
  );

  const nextPage = useCallback(() => {
    goToPage(pagination.page + 1);
  }, [pagination.page, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(pagination.page - 1);
  }, [pagination.page, goToPage]);

  const setLimit = useCallback(
    (limit: number) => {
      if (limit < 1 || limit > 100) return;

      startTransition(() => {
        const current = new URLSearchParams(searchParams.toString());
        const query = updateQueryWithPagination(current, 1, limit);
        router.push(`${pathname}?${query}`);
      });
    },
    [searchParams, router, pathname]
  );

  const resetPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  return {
    pagination,
    goToPage,
    nextPage,
    prevPage,
    setLimit,
    resetPage,
    isPending,
  };
}

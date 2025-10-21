"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ZodObject, ZodRawShape, z } from "zod";
import {
  parseFiltersFromQuery,
  updateQueryWithFilters,
  hasActiveFilters,
} from "@/utils/table/filters";

export interface UseTableFiltersOptions<
  TSchema extends ZodObject<ZodRawShape>,
> {
  schema: TSchema;
  initialFilters?: Partial<z.infer<TSchema>>;
}

export interface UseTableFiltersReturn<T> {
  filters: Partial<T>;
  hasFilters: boolean;
  setFilters: (
    filters: Partial<T> | ((prev: Partial<T>) => Partial<T>)
  ) => void;
  clearAllFilters: () => void;
}

export function useTableFilters<TSchema extends ZodObject<ZodRawShape>>({
  schema,
  initialFilters = {},
}: UseTableFiltersOptions<TSchema>): UseTableFiltersReturn<z.infer<TSchema>> {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  type InferredFilters = z.infer<TSchema>;

  // Parse initial filters from URL or use provided initial filters
  const urlFilters = useMemo(
    () => parseFiltersFromQuery(searchParams.toString(), schema),
    [searchParams, schema]
  );

  const [localFilters, setLocalFilters] = useState<Partial<InferredFilters>>({
    ...initialFilters,
    ...urlFilters,
  });

  const hasFilters = useMemo(
    () => hasActiveFilters(localFilters),
    [localFilters]
  );

  const setFilters = useCallback(
    (
      filters:
        | Partial<InferredFilters>
        | ((prev: Partial<InferredFilters>) => Partial<InferredFilters>)
    ) => {
      const newFilters =
        typeof filters === "function"
          ? filters(localFilters)
          : { ...localFilters, ...filters };

      setLocalFilters(newFilters);

      // Use startTransition to defer URL update (non-blocking)
      startTransition(() => {
        const current = new URLSearchParams(searchParams.toString());
        const query = updateQueryWithFilters(current, newFilters);
        router.push(`${pathname}?${query}`);
      });
    },
    [localFilters, searchParams, router, pathname, startTransition]
  );

  const clearAllFilters = useCallback(() => {
    setLocalFilters({});

    startTransition(() => {
      const current = new URLSearchParams(searchParams.toString());

      const keysToDelete: string[] = [];
      current.forEach((_, key) => {
        if (key === "where" || key.startsWith("where[")) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach((key) => current.delete(key));

      current.delete("page");

      const query = current.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }, [searchParams, router, pathname]);

  return {
    filters: localFilters,
    hasFilters,
    setFilters,
    clearAllFilters,
  };
}

"use client";

import { Button } from "@/components/ui/button";
import { PaginationMeta } from "@repo/core";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getPaginationDisplayInfo,
  getVisiblePageNumbers,
} from "@/utils/table/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTablePagination } from "@/hooks";

export interface TablePaginationProps {
  pagination: PaginationMeta;
  maxVisiblePages?: number;
  showLimitSelector?: boolean;
  limitOptions?: number[];
}

const LIMIT_OPTIONS = [10, 25, 50, 100];

export function TablePagination({
  pagination,
  maxVisiblePages = 5,
  showLimitSelector = true,
}: TablePaginationProps) {
  const { goToPage, setLimit, isPending } = useTablePagination();

  const t = useTranslations("TablePagination");
  const { page, limit, total, totalPages, hasNext, hasPrev } = pagination;

  const { startItem, endItem } = getPaginationDisplayInfo(pagination);
  const visiblePages = getVisiblePageNumbers(page, totalPages, maxVisiblePages);

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {t("showing", { startItem, endItem, total })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(page - 1)}
          disabled={!hasPrev || isPending}
          aria-label={t("previous")}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">
            {t("previous")}
          </span>
        </Button>

        <div className="flex items-center gap-1">
          {visiblePages.map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === page ? "default" : "outline"}
              size="sm"
              className="min-w-[2.5rem]"
              onClick={() => goToPage(pageNum)}
              disabled={isPending}
              aria-label={t("goToPage", { page: pageNum })}
              aria-current={pageNum === page ? "page" : undefined}
            >
              {pageNum}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(page + 1)}
          disabled={!hasNext || isPending}
          aria-label={t("next")}
        >
          <span className="sr-only sm:not-sr-only sm:mr-1">{t("next")}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {showLimitSelector && (
          <div className="flex items-center gap-2">
            <div className="relative group">
              <Select
                value={String(limit)}
                onValueChange={(v: string) => setLimit(Number(v))}
                disabled={isPending}
              >
                <SelectTrigger id="limit-select">
                  <SelectValue placeholder={t("itemsPerPage")}>
                    {t("itemsPerPageShort", { count: limit })}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LIMIT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

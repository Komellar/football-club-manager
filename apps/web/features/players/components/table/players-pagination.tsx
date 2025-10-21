import { Button } from "@/components/ui/button";
import { PaginationMeta } from "@repo/core";
import { useTranslations } from "next-intl";

interface PlayersPaginationProps {
  pagination: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export function PlayersPagination({
  pagination,
  onPageChange,
}: PlayersPaginationProps) {
  const t = useTranslations("PlayersPagination");
  const { page, limit, total, totalPages, hasNext, hasPrev } = pagination;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        {t("showing", { startItem, endItem, total })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev}
            onClick={() => onPageChange?.(page - 1)}
          >
            {t("previous")}
          </Button>

          <div className="flex items-center space-x-1">
            {/* Show page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;

              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => onPageChange?.(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            onClick={() => onPageChange?.(page + 1)}
          >
            {t("next")}
          </Button>
        </div>
      )}
    </div>
  );
}

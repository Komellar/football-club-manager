"use client";

import { ReactNode, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { FilterIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UseTableFiltersReturn } from "@/hooks";

interface FilterDrawerProps<T> {
  filterHook: UseTableFiltersReturn<T>;
  title: string;
  description?: string;
  triggerLabel?: string;
  children: (props: {
    filters: Partial<T>;
    setFilters: React.Dispatch<React.SetStateAction<Partial<T>>>;
  }) => ReactNode;
}

export function FilterDrawer<T>({
  filterHook,
  title,
  description,
  triggerLabel,
  children,
}: FilterDrawerProps<T>) {
  const t = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const { filters, setFilters, clearAllFilters, hasFilters } = filterHook;

  const handleClearFilters = () => {
    clearAllFilters();
    setOpen(false);
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof T] !== undefined
  ).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <FilterIcon className="mr-2 h-4 w-4" />
          {triggerLabel || t("filters")}
          {activeFilterCount > 0 && (
            <Badge
              variant="default"
              className="ml-2 h-5 min-w-5 rounded-full px-1.5"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="space-y-6 py-6">
          {children({ filters, setFilters })}
        </div>

        <SheetFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={!hasFilters}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            {t("clearFilters")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

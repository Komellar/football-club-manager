import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { SortOrder } from "@repo/core";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SortableHeaderProps {
  label: string;
  sortState?: SortOrder;
  onSort: () => void;
  className?: string;
}

export function SortableHeader({
  label,
  sortState,
  onSort,
  className,
}: SortableHeaderProps) {
  return (
    <Button
      variant="ghost"
      onClick={onSort}
      className={cn(
        "h-auto p-0 font-semibold hover:bg-transparent hover:text-foreground",
        className
      )}
    >
      {label}
      <span className="ml-2">
        {sortState === SortOrder.ASC && <ArrowUp className="h-4 w-4" />}
        {sortState === SortOrder.DESC && <ArrowDown className="h-4 w-4" />}
        {!sortState && <ArrowUpDown className="h-4 w-4 opacity-50" />}
      </span>
    </Button>
  );
}

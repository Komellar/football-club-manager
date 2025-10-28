import { Badge } from "@/components/ui/badge";
import { dateToString } from "@/utils/date";
import { ContractResponseDto } from "@repo/core";
import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { getDaysUntilExpiry } from "../../utils";

export function ExpiringItem({ contract }: { contract: ContractResponseDto }) {
  const daysUntilExpiry = getDaysUntilExpiry(contract.endDate);
  const isCritical = daysUntilExpiry <= 14;

  return (
    <Link
      key={contract.id}
      href={`/contracts/${contract.id}`}
      className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-accent hover:border-accent-foreground/20 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {contract.player?.name || "Unknown Player"}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <CalendarClock className="h-3 w-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {dateToString(contract.endDate)}
          </p>
        </div>
      </div>
      <Badge
        variant={isCritical ? "destructive" : "secondary"}
        className="ml-2 shrink-0"
      >
        {daysUntilExpiry}d
      </Badge>
    </Link>
  );
}

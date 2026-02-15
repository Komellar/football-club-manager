"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { TransferResponseDto, TransferDirection } from "@repo/core";
import { formatCurrency } from "@/utils/currency";
import { dateToString } from "@/utils/date";
import {
  formatTransferType,
  formatTransferStatus,
  formatTransferDirection,
} from "@/features/transfers/utils";
import {
  transferTypeColors,
  transferStatusColors,
  transferDirectionColors,
} from "@/features/transfers/constants";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface TransferHistoryItemProps {
  transfer: TransferResponseDto;
  locale: string;
}

export function TransferHistoryItem({
  transfer,
  locale,
}: TransferHistoryItemProps) {
  const tTransfers = useTranslations("Transfers");

  const fromClub =
    transfer.transferDirection === TransferDirection.INCOMING
      ? transfer.otherClubName || "Unknown Club"
      : "My Club";
  const toClub =
    transfer.transferDirection === TransferDirection.OUTGOING
      ? transfer.otherClubName || "Unknown Club"
      : "My Club";

  return (
    <Link href={`/${locale}/transfers/${transfer.id}`} className="block">
      <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent transition-colors">
        <div className="flex-shrink-0 mt-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={transferDirectionColors[transfer.transferDirection]}
              >
                {formatTransferDirection(transfer.transferDirection)}
              </Badge>
              <Badge
                variant="outline"
                className={transferTypeColors[transfer.transferType]}
              >
                {formatTransferType(transfer.transferType)}
              </Badge>
              <Badge
                variant="outline"
                className={transferStatusColors[transfer.transferStatus]}
              >
                {formatTransferStatus(transfer.transferStatus)}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {dateToString(transfer.transferDate)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
            <span>{fromClub}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span>{toClub}</span>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground">
            {transfer.transferFee && (
              <div>
                <span className="font-medium">
                  {tTransfers("transferFee")}:
                </span>{" "}
                {formatCurrency(transfer.transferFee)}
              </div>
            )}
            {transfer.agentFee && (
              <div>
                <span className="font-medium">{tTransfers("agentFee")}:</span>{" "}
                {formatCurrency(transfer.agentFee)}
              </div>
            )}
          </div>

          {transfer.notes && (
            <div className="text-sm text-muted-foreground italic">
              {transfer.notes}
            </div>
          )}

          {transfer.isActiveLoan && (
            <Badge variant="secondary" className="mt-2">
              {tTransfers("activeLoan")}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}

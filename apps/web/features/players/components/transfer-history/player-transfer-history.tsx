"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { TransferHistoryDto } from "@repo/core";
import { formatCurrency } from "@/utils/currency";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TransferHistoryItem } from "./transfer-history-item";

interface PlayerTransferHistoryProps {
  transferHistory: TransferHistoryDto;
  locale: string;
}

export function PlayerTransferHistory({
  transferHistory,
  locale,
}: PlayerTransferHistoryProps) {
  const {
    playerId,
    transfers,
    currentClub,
    careerTransfersValue,
    totalTransfers,
  } = transferHistory;
  const t = useTranslations("Players");
  const tTransfers = useTranslations("Transfers");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalTransfers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransfers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("currentClub")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentClub || t("freeAgent")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {t("careerValue")}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {careerTransfersValue
                ? formatCurrency(careerTransfersValue)
                : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transfer History Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>{t("transferHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("noTransferHistory")}
            </div>
          ) : (
            <div className="space-y-4">
              {transfers.map((transfer) => (
                <TransferHistoryItem
                  key={transfer.id}
                  transfer={transfer}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Transfer Button */}
      <div className="flex justify-end">
        <Link href={`/${locale}/transfers/new?playerId=${playerId}`}>
          <Button>{tTransfers("addTransfer")}</Button>
        </Link>
      </div>
    </div>
  );
}

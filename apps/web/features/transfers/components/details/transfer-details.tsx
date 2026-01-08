import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransferResponseDto } from "@repo/core";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import {
  getTransferDirectionColor,
  getTransferStatusColor,
  getTransferTypeColor,
  formatTransferDirection,
  formatTransferStatus,
  formatTransferType,
} from "../../utils/format";
import { getTranslations } from "next-intl/server";

interface TransferDetailsProps {
  transfer: TransferResponseDto;
}

export async function TransferDetails({ transfer }: TransferDetailsProps) {
  const t = await getTranslations("Transfers");

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd MMMM yyyy");
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.basicInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {transfer.player && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("player")}
              </label>
              <div className="flex items-center justify-between mt-1">
                <p className="text-base">
                  {transfer.player.name}
                  {transfer.player.jerseyNumber &&
                    ` #${transfer.player.jerseyNumber}`}
                </p>
                <Link href={`/players/${transfer.player.id}`}>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("direction")}
            </label>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={getTransferDirectionColor(
                  transfer.transferDirection
                )}
              >
                {formatTransferDirection(transfer.transferDirection)}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("type")}
            </label>
            <div className="mt-1">
              <Badge className={getTransferTypeColor(transfer.transferType)}>
                {formatTransferType(transfer.transferType)}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("status")}
            </label>
            <div className="mt-1">
              <Badge
                className={getTransferStatusColor(transfer.transferStatus)}
              >
                {formatTransferStatus(transfer.transferStatus)}
              </Badge>
            </div>
          </div>

          {transfer.otherClubName && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("club")}
              </label>
              <p className="text-base mt-1 font-medium">
                {transfer.otherClubName}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfer Details & Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.transferDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("date")}
            </label>
            <p className="text-base mt-1">
              {formatDate(transfer.transferDate)}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("permanentType")}
            </label>
            <p className="text-base mt-1">
              {transfer.isPermanent ? t("permanent") : t("temporary")}
            </p>
          </div>

          {transfer.loanEndDate && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("loanEndDate")}
              </label>
              <p className="text-base mt-1">
                {formatDate(transfer.loanEndDate)}
              </p>
            </div>
          )}

          {transfer.contractLengthMonths && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("contractLength")}
              </label>
              <p className="text-base mt-1">
                {transfer.contractLengthMonths} {t("months")}
              </p>
            </div>
          )}

          {transfer.transferDurationDays !== undefined && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("transferDuration")}
              </label>
              <p className="text-base mt-1">
                {transfer.transferDurationDays} {t("days")}
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">
              {t("sections.financialInfo")}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("transferFee")}
                </label>
                <p className="text-base mt-1 font-semibold">
                  {formatCurrency(transfer.transferFee)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("agentFee")}
                </label>
                <p className="text-base mt-1">
                  {formatCurrency(transfer.agentFee)}
                </p>
              </div>

              {transfer.annualSalary && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("annualSalary")}
                  </label>
                  <p className="text-base mt-1">
                    {formatCurrency(transfer.annualSalary)}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("totalCost")}
                </label>
                <p className="text-xl mt-1 font-bold text-primary">
                  {formatCurrency(
                    (transfer.transferFee || 0) + (transfer.agentFee || 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      {transfer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.additionalInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("notes")}
              </label>
              <p className="text-base mt-1 whitespace-pre-wrap">
                {transfer.notes}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.systemInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("createdAt")}
            </label>
            <p className="text-sm mt-1">
              {format(new Date(transfer.createdAt), "dd MMMM yyyy HH:mm")}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("updatedAt")}
            </label>
            <p className="text-sm mt-1">
              {format(new Date(transfer.updatedAt), "dd MMMM yyyy HH:mm")}
            </p>
          </div>

          {transfer.createdBy && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("createdBy")}
              </label>
              <p className="text-sm mt-1">{transfer.createdBy}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

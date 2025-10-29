"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { ContractResponseDto, ContractValueCalculation } from "@repo/core";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { calculateDurationInMonths, getStatusBadgeVariant } from "../../utils";
import { Suspense } from "react";
import { ContractFinancialDetails } from "./contract-financial-details";
import { formatCurrency } from "@/utils/currency";

interface ContractDetailsProps {
  contract: ContractResponseDto;
  valueCalculationPromise: Promise<ContractValueCalculation | null>;
}

export function ContractDetails({
  contract,
  valueCalculationPromise,
}: ContractDetailsProps) {
  const t = useTranslations("Contracts");

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "dd MMMM yyyy");
  };

  const duration = calculateDurationInMonths(
    contract.startDate,
    contract.endDate
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.basicInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contract.player && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("player")}
              </label>
              <div className="flex items-center justify-between mt-1">
                <p className="text-base">
                  {contract.player.name}
                  {contract.player.jerseyNumber &&
                    ` #${contract.player.jerseyNumber}`}
                </p>
                <Link href={`/players/${contract.player.id}`}>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("contractType")}
            </label>
            <p className="text-base mt-1">
              {t(`types.${contract.contractType.toLowerCase()}`)}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("status")}
            </label>
            <div className="mt-1">
              <Badge variant={getStatusBadgeVariant(contract.status)}>
                {t(`statuses.${contract.status.toLowerCase()}`)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Period */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.contractPeriod")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("startDate")}
            </label>
            <p className="text-base mt-1">{formatDate(contract.startDate)}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("endDate")}
            </label>
            <p className="text-base mt-1">{formatDate(contract.endDate)}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("duration")}
            </label>
            <p className="text-base mt-1">
              {duration} {t("months")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.financial")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={<Loader2 />}>
            <ContractFinancialDetails
              valueCalculationPromise={valueCalculationPromise}
            />
          </Suspense>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("salary")}
            </label>
            <p className="text-base mt-1 font-semibold">
              {formatCurrency(contract.salary)}
            </p>
          </div>

          {contract.bonuses !== undefined && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("bonuses")}
              </label>
              <p className="text-base mt-1">
                {formatCurrency(contract.bonuses)}
              </p>
            </div>
          )}

          {contract.signOnFee !== undefined && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("signOnFee")}
              </label>
              <p className="text-base mt-1">
                {formatCurrency(contract.signOnFee)}
              </p>
            </div>
          )}

          {contract.agentFee !== undefined && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("agentFee")}
              </label>
              <p className="text-base mt-1">
                {formatCurrency(contract.agentFee)}
              </p>
            </div>
          )}

          {contract.releaseClause !== undefined && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("releaseClause")}
              </label>
              <p className="text-base mt-1">
                {formatCurrency(contract.releaseClause)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
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
              {contract.notes}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

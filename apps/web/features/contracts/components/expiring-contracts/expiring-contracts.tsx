"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContractResponseDto } from "@repo/core";
import { useTranslations } from "next-intl";
import { ExpiringItem } from "./expiring-item";

interface ExpiringContractsProps {
  expiringContracts: ContractResponseDto[];
  criticalContracts: ContractResponseDto[];
  days: number;
}

export function ExpiringContracts({
  expiringContracts,
  criticalContracts,
  days,
}: ExpiringContractsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const t = useTranslations("Contracts");

  if (expiringContracts.length === 0) {
    return null;
  }

  const displayedContracts = showAll
    ? expiringContracts
    : expiringContracts.slice(0, 3);
  const hasMore = expiringContracts.length > 3;

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">{t("expiringContracts")}</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            {expiringContracts.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {criticalContracts.length > 0 && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">
                  {t("criticalExpiry")}
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {t("criticalExpiryDescription", {
                    count: criticalContracts.length,
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between hover:bg-amber-100/50"
        >
          <span className="text-sm text-muted-foreground">
            {isOpen ? t("hideDetails") : t("showDetails")}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {isOpen && (
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              {t("expiringContractsDescription", { days })}
            </p>

            <div className="space-y-2">
              {displayedContracts.map((contract) => (
                <ExpiringItem key={contract.id} contract={contract} />
              ))}
            </div>

            {hasMore && !showAll && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowAll(true)}
                className="w-full text-primary hover:underline mt-3"
              >
                {t("viewAllExpiring", { count: expiringContracts.length - 3 })}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

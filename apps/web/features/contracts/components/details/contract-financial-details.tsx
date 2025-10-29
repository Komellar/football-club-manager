"use client";

import { useTranslations } from "next-intl";
import { ContractValueCalculation } from "@repo/core";
import { formatCurrency } from "@/utils/currency";
import { TrendingUp, DollarSign, Award } from "lucide-react";
import { use, useEffect, useRef } from "react";
import { toast } from "sonner";

interface ContractFinancialDetailsProps {
  valueCalculationPromise: Promise<ContractValueCalculation | null>;
}

export function ContractFinancialDetails({
  valueCalculationPromise,
}: ContractFinancialDetailsProps) {
  const t = useTranslations("Contracts");
  const valueCalculation = use(valueCalculationPromise);
  const toastShownRef = useRef(false);

  // Show toast if calculation failed to load (only once)
  useEffect(() => {
    if (valueCalculation === null && !toastShownRef.current) {
      toast.error(t("valueCalculationError"));
      toastShownRef.current = true;
    }
  }, [valueCalculation, t]);

  if (!valueCalculation) {
    return null;
  }

  const remainingPercentage = Math.round(
    (valueCalculation.remainingValue / valueCalculation.totalValue) * 100
  );

  return (
    <div className="space-y-4 pb-4 border-b">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start gap-2">
          <DollarSign className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {t("totalContractValue")}
            </label>
            <p className="text-lg font-bold">
              {formatCurrency(valueCalculation.totalValue)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {t("remainingValue")}
            </label>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(valueCalculation.remainingValue)}
            </p>
            <p className="text-xs text-muted-foreground">
              {remainingPercentage}% {t("remaining")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Award className="h-4 w-4" />
        <span>
          {valueCalculation.remainingMonths} {t("monthsRemaining")}
        </span>
      </div>
    </div>
  );
}

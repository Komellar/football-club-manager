import { getFinancialSummary } from "@/features/finance/api/finance";
import { Suspense } from "react";
import FinanceLoading from "./loading";
import { DateRangeSelector } from "@/features/finance/components/date-range-selector";
import { FinanceCharts } from "@/features/finance/components/finance-charts";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";

interface FinanceSlotProps {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function FinanceSlot({ searchParams }: FinanceSlotProps) {
  const params = await searchParams;
  const t = await getTranslations("Dashboard");

  const currentYear = new Date().getFullYear();
  const startDate = params.startDate || `${currentYear}-01-01`;
  const endDate = params.endDate || format(new Date(), "yyyy-MM-dd");

  const data = await getFinancialSummary(startDate, endDate);

  return (
    <Suspense fallback={<FinanceLoading />}>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">
          {t("financialOverview")}
        </h2>
        <DateRangeSelector startDate={startDate} endDate={endDate} />
        <FinanceCharts data={data} />
      </div>
    </Suspense>
  );
}

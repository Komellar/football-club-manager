import { FinancialSummary } from "@repo/core";
import { OverviewChart } from "./charts/overview-chart";
import { PieChartCard } from "./charts/pie-chart-card";
import { SummaryCard } from "./charts/summary-card";
import {
  prepareIncomeData,
  prepareExpenseData,
  prepareOverviewData,
} from "../utils/chart-data";
import { getTranslations } from "next-intl/server";
import { formatCurrency } from "@/utils/currency";
import {
  expenseBreakdownChartConfig,
  incomeBreakdownChartConfig,
} from "../utils/charts-configs";

interface FinanceChartsProps {
  data: FinancialSummary;
}

export async function FinanceCharts({ data }: FinanceChartsProps) {
  const t = await getTranslations("Finance");
  const incomeData = prepareIncomeData(data);
  const expenseData = prepareExpenseData(data);
  const overviewData = prepareOverviewData(data);
  console.log(data);

  return (
    <div className="grid gap-4 grid-cols-1">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <SummaryCard data={data} />
        <OverviewChart data={overviewData} />

        <PieChartCard
          title={t("incomeBreakdown")}
          description={`${formatCurrency(data.summary.totalIncome)} ${t("totalIncomeAmount")}`}
          data={incomeData}
          chartConfig={incomeBreakdownChartConfig}
        />

        <PieChartCard
          title={t("expenseBreakdown")}
          description={`${formatCurrency(data.summary.totalExpenses)} ${t("totalExpensesAmount")}`}
          data={expenseData}
          chartConfig={expenseBreakdownChartConfig}
        />
      </div>
    </div>
  );
}

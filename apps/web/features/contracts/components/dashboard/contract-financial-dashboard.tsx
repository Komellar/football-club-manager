import { ContractsByTypeChart } from "./contracts-by-type-chart";
import { FinancialMetricsCards } from "./financial-metrics-cards";
import { ExpiringContractsChart } from "./expiring-contracts-chart";
import type { ContractFinancialSummary } from "@repo/core";
import { getTranslations } from "next-intl/server";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";

interface ContractFinancialDashboardProps {
  summary: ContractFinancialSummary;
}

export async function ContractFinancialDashboard({
  summary,
}: ContractFinancialDashboardProps) {
  const t = await getTranslations("Dashboard");
  const tC = await getTranslations("Common");

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>{tC("noData")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <FinancialMetricsCards summary={summary} />

      {summary.totalContracts === 0 ? (
        <Card>
          <CardHeader>
            <CardDescription>{t("noActiveContracts")}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <ContractsByTypeChart contractsByType={summary.contractsByType} />

          <ExpiringContractsChart
            expiringCount={summary.upcomingExpiries.count}
            totalContracts={summary.totalContracts}
          />
        </div>
      )}
    </div>
  );
}

import { getFinancialSummaryServer } from "@/features/contracts/api";
import { getTranslations } from "next-intl/server";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import {
  ContractsByTypeChart,
  ExpiringContractsChart,
  FinancialMetricsCards,
} from "@/features/contracts/components/dashboard";

export default async function ContractsSlot() {
  const t = await getTranslations("Dashboard");
  const tC = await getTranslations("Common");
  const summary = await getFinancialSummaryServer();

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
    <div>
      <h2 className="text-2xl font-semibold mb-4">{t("contractOverview")}</h2>
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
    </div>
  );
}

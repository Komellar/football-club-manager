import { ContractFinancialDashboard } from "@/features/contracts/components/dashboard";
import { getFinancialSummaryServer } from "@/features/contracts/api";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const summary = await getFinancialSummaryServer();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              {t("contractOverview")}
            </h2>
            <ContractFinancialDashboard summary={summary} />
          </div>
        </div>
      </div>
    </div>
  );
}

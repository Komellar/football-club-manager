import { formatCurrency } from "@/utils/currency";
import { DollarSign, FileText, TrendingUp, BarChart } from "lucide-react";
import { ContractFinancialSummary } from "@repo/core";
import { getTranslations } from "next-intl/server";

export async function getDashboardMetrics(summary: ContractFinancialSummary) {
  const t = await getTranslations("Dashboard.contractMetrics");
  return [
    {
      title: t("totalActiveValue"),
      value: formatCurrency(summary.totalActiveValue),
      description: t("totalActiveValueDescription"),
      icon: DollarSign,
    },
    {
      title: t("monthlyCommitment"),
      value: formatCurrency(summary.totalMonthlyCommitment),
      description: t("monthlyCommitmentDescription"),
      icon: TrendingUp,
    },
    {
      title: t("averageSalary"),
      value: formatCurrency(summary.averageSalary),
      description: t("averageSalaryDescription"),
      icon: BarChart,
    },
    {
      title: t("totalContracts"),
      value: summary.totalContracts.toString(),
      description: t("totalContractsDescription", {
        count: summary.upcomingExpiries.count,
      }),
      icon: FileText,
    },
  ];
}

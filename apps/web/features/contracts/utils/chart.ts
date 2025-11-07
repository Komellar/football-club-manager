import { ContractType } from "@repo/core";
import { ChartConfig } from "@/components/ui/chart";
import { ChartDataItem } from "@/types/chart";

export const contractByTypeChartConfig = {
  [ContractType.PERMANENT]: {
    label: "Permanent",
    color: "var(--chart-1)",
  },
  [ContractType.LOAN]: {
    label: "Loan",
    color: "var(--chart-2)",
  },
  [ContractType.YOUTH]: {
    label: "Youth",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export const expiringContractChartConfig = {
  longTerm: {
    label: "Active",
    color: "var(--chart-3)",
  },
  expiring: {
    label: "Expiring Soon",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function transformContractDataForChart(
  contractsByType: Record<string, number>,
  chartConfig: ChartConfig
): ChartDataItem[] {
  return Object.entries(contractsByType)
    .filter(([_, value]) => value > 0)
    .map(([type, value]) => ({
      type,
      value,
      fill: chartConfig[type as ContractType]?.color || "var(--chart-4)",
    }));
}

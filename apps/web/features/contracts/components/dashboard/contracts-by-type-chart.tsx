import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  transformContractDataForChart,
  contractByTypeChartConfig,
} from "@/features/contracts/utils/chart";
import { PieChartClient } from "@/components/shared/charts";
import { getTranslations } from "next-intl/server";

interface ContractsByTypeChartProps {
  contractsByType: Record<string, number>;
}

export async function ContractsByTypeChart({
  contractsByType,
}: ContractsByTypeChartProps) {
  const t = await getTranslations("Dashboard");
  const chartData = transformContractDataForChart(
    contractsByType,
    contractByTypeChartConfig
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("contractsByType")}</CardTitle>
        <CardDescription>{t("contractDistribution")}</CardDescription>
      </CardHeader>
      <CardContent>
        <PieChartClient
          chartData={chartData}
          chartConfig={contractByTypeChartConfig}
        />
      </CardContent>
    </Card>
  );
}

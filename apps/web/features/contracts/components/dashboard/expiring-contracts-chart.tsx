import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChartClient } from "@/components/shared/charts";
import {
  expiringContractChartConfig,
  transformContractDataForChart,
} from "../../utils/chart";
import { getTranslations } from "next-intl/server";

interface ExpiringContractsChartProps {
  expiringCount: number;
  totalContracts: number;
}

export async function ExpiringContractsChart({
  expiringCount,
  totalContracts,
}: ExpiringContractsChartProps) {
  const t = await getTranslations("Dashboard");
  const longTermCount = totalContracts - expiringCount;

  const chartData = transformContractDataForChart(
    {
      longTerm: longTermCount,
      expiring: expiringCount,
    },
    expiringContractChartConfig
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("contractExpiries")}</CardTitle>
        <CardDescription>{t("expiringVsActive")}</CardDescription>
      </CardHeader>
      <CardContent>
        <PieChartClient
          chartData={chartData}
          chartConfig={expiringContractChartConfig}
        />
      </CardContent>
    </Card>
  );
}

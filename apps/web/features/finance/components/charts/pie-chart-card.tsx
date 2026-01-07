import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChartClient } from "@/components/shared/charts";
import { transformContractDataForChart } from "@/features/contracts/utils/chart";
import { ChartConfig } from "@/components/ui/chart";
import { getTranslations } from "next-intl/server";

interface PieChartCardProps {
  title: string;
  description: string;
  data: Record<string, number>;
  chartConfig: ChartConfig;
}

export async function PieChartCard({
  title,
  description,
  data,
  chartConfig,
}: PieChartCardProps) {
  const t = await getTranslations("Finance");

  const chartData = transformContractDataForChart(data, chartConfig);

  if (Object.entries(data).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            {t("noDataAvailable")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <PieChartClient
          chartData={chartData}
          chartConfig={chartConfig}
          isMonetary
        />
      </CardContent>
    </Card>
  );
}

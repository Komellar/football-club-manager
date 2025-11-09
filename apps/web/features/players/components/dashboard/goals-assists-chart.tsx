"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PlayerStatisticsResponseDto } from "@repo/core";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { getGoalsAndAssistsBySeason } from "../../utils";
import { goalAssistChartConfig } from "../../constants";
import { useTranslations } from "next-intl";

interface GoalsAssistsChartProps {
  statistics: Record<string, PlayerStatisticsResponseDto[]>;
}

export function GoalsAssistsChart({ statistics }: GoalsAssistsChartProps) {
  const t = useTranslations("Players.performanceTab");
  const chartData = getGoalsAndAssistsBySeason(statistics);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("goalsAssistsChart")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={goalAssistChartConfig}
          className="min-h-[100px] w-full"
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="season" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="goals"
              fill="var(--color-goals)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="assists"
              fill="var(--color-assists)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PlayerStatisticsResponseDto } from "@repo/core";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { getPerformanceRatingsBySeason } from "../../utils";
import { ratingChartConfig } from "../../constants";
import { useTranslations } from "next-intl";

interface PerformanceChartProps {
  statistics: Record<string, PlayerStatisticsResponseDto[]>;
}

export function PerformanceChart({ statistics }: PerformanceChartProps) {
  const t = useTranslations("Players.performanceTab");
  const chartData = getPerformanceRatingsBySeason(statistics);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("performanceChart")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={ratingChartConfig}
          className="min-h-[100px] w-full"
        >
          <LineChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="season"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis domain={[5, 10]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="natural"
              dataKey="rating"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={{
                fill: "var(--chart-3)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

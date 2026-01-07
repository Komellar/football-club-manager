"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/utils/currency";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { overviewChartConfig } from "../../utils/charts-configs";
import { TooltipContent } from "@/components/shared/charts";

interface OverviewChartProps {
  data: Array<{ month: string; income: number; expenses: number }>;
}

export function OverviewChart({ data }: OverviewChartProps) {
  const t = useTranslations("Finance");

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>{t("financialOverview")}</CardTitle>
        <CardDescription>{t("overviewDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={overviewChartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <YAxis
              tickFormatter={(value) => {
                const x = formatCurrency(value);
                if (x.length > 16) {
                  return x.slice(0, -17) + "B €";
                } else if (x.length > 12) {
                  return x.slice(0, -13) + "M €";
                }
                return x.slice(0, -5) + "€";
              }}
              width={60}
              dataKey="expenses"
              type="number"
              tickLine={false}
              axisLine={false}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => (
                    <TooltipContent
                      value={value}
                      name={name}
                      chartConfig={overviewChartConfig}
                      isMonetary
                    />
                  )}
                />
              }
            />
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

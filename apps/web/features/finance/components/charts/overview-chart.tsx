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

interface OverviewChartProps {
  data: Array<{ category: string; amount: number }>;
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
              dataKey="amount"
              type="number"
              tickLine={false}
              axisLine={false}
            />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="amount" fill="var(--chart-1)" radius={4} />
            {/* <Bar dataKey="amount" fill="var(--chart-2)" radius={4} /> */}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

"use client";

import { Pie, PieChart, Cell, Legend } from "recharts";
import { ContractType } from "@repo/core";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartDataItem } from "@/types/chart";

interface PieChartClientProps {
  chartData: ChartDataItem[];
  chartConfig: ChartConfig;
}

export function PieChartClient({
  chartData,
  chartConfig,
}: PieChartClientProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[150px] w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                chartConfig[value as ContractType]?.label || value
              }
            />
          }
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="type"
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="70%"
          paddingAngle={2}
          label={({ value, percent }) => {
            if (percent < 0.0001) return `${value} (<0.01%)`;
            return `${value} (${(percent * 100).toFixed(1)}%)`;
          }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) =>
            chartConfig[value as ContractType]?.label || value
          }
        />
      </PieChart>
    </ChartContainer>
  );
}

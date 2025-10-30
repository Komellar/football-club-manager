import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContractFinancialSummary } from "@repo/core";
import { getDashboardMetrics } from "../../utils";

interface FinancialMetricsCardsProps {
  summary: ContractFinancialSummary;
}

export async function FinancialMetricsCards({
  summary,
}: FinancialMetricsCardsProps) {
  const metrics = await getDashboardMetrics(summary);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

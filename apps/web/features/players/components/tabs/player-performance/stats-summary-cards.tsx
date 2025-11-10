import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerStatisticsResponseDto } from "@repo/core";
import { getTranslations } from "next-intl/server";
import { getSummaryCards } from "../../../utils";

interface StatsSummaryCardsProps {
  statistics: PlayerStatisticsResponseDto[];
}

export async function StatsSummaryCards({
  statistics,
}: StatsSummaryCardsProps) {
  const t = await getTranslations("Players.performanceTab.statsSummaryCards");

  const summaryCards = getSummaryCards(statistics, t);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

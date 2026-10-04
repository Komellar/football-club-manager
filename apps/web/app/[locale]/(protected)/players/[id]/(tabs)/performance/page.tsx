import { Alert, AlertDescription } from "@/components/ui/alert";
import { getPlayerPerformanceSummary } from "@/features/players/api";
import { getPlayerById } from "@/features/players/api/players";
import {
  GoalsAssistsChart,
  PerformanceChart,
  SeasonStatsTable,
  StatsSummaryCards,
} from "@/features/players/components/tabs";
import { Info } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function PlayerPerformancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("Players.performanceTab");
  const { id } = await params;

  const playerId = Number(id);
  const [player, summary] = await Promise.all([
    getPlayerById(playerId),
    getPlayerPerformanceSummary(playerId),
  ]);

  if (summary.totals.appearances === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{t("noStatsMessage")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <StatsSummaryCards summary={summary} />

      <div className="grid md:grid-cols-2 md:gap-x-6 gap-x-0 gap-y-6">
        <GoalsAssistsChart statistics={summary.seasons} />
        <PerformanceChart statistics={summary.seasons} />
      </div>

      <SeasonStatsTable
        statistics={summary.seasons}
        position={player.position}
      />
    </div>
  );
}

import { Alert, AlertDescription } from "@/components/ui/alert";
import { getPlayerStatistics } from "@/features/players/api";
import { getPlayerById } from "@/features/players/api/players";
import {
  GoalsAssistsChart,
  PerformanceChart,
  SeasonStatsTable,
  StatsSummaryCards,
} from "@/features/players/components/tabs";
import { groupStatisticsBySeason } from "@/features/players/utils";
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
  const [player, { data }] = await Promise.all([
    getPlayerById(playerId),
    getPlayerStatistics(playerId),
  ]);

  const statisticsBySeason = groupStatisticsBySeason(data);

  if (!data || data.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{t("noStatsMessage")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <StatsSummaryCards statistics={data} />

      <div className="grid md:grid-cols-2 md:gap-x-6 gap-x-0 gap-y-6">
        <GoalsAssistsChart statistics={statisticsBySeason} />
        <PerformanceChart statistics={statisticsBySeason} />
      </div>

      <SeasonStatsTable
        statistics={statisticsBySeason}
        position={player.position}
      />
    </div>
  );
}

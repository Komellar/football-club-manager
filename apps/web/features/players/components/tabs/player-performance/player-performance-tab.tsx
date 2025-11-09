import { getPlayerStatistics } from "@/features/players/api";
import {
  StatsSummaryCards,
  GoalsAssistsChart,
  PerformanceChart,
  SeasonStatsTable,
} from "@/features/players/components/dashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { groupStatisticsBySeason } from "@/features/players/utils";
import { PlayerResponseDto } from "@repo/core";
import { getTranslations } from "next-intl/server";

interface PlayerPerformanceProps {
  playerId: number;
  player: PlayerResponseDto;
}

export async function PlayerPerformanceTab({
  playerId,
  player,
}: PlayerPerformanceProps) {
  const t = await getTranslations("Players.performanceTab");
  const { data } = await getPlayerStatistics(playerId);

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

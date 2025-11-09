import { PlayerPosition, PlayerStatisticsResponseDto } from "@repo/core";
import { PureStats } from "../types/stats";

function getStatsSummaryData(statistics: PlayerStatisticsResponseDto[]) {
  const totalStats = statistics.reduce(
    (acc, stat) => ({
      minutesPlayed: acc.minutesPlayed + stat.minutesPlayed,
      goals: acc.goals + stat.goals,
      assists: acc.assists + stat.assists,
    }),
    {
      minutesPlayed: 0,
      goals: 0,
      assists: 0,
    }
  );

  const seasonsCount = new Set(statistics.map((stat) => stat.season)).size;

  const avgRating =
    statistics.filter((s) => s.rating).length > 0
      ? statistics.reduce((sum, s) => sum + (s.rating || 0), 0) /
        statistics.filter((s) => s.rating).length
      : null;

  return { totalStats, seasonsCount, avgRating };
}

export function getSummaryCards(
  statistics: PlayerStatisticsResponseDto[],
  t: (key: string, params?: Record<string, any>) => string
) {
  const { totalStats, seasonsCount, avgRating } =
    getStatsSummaryData(statistics);

  return [
    {
      title: t("totalAppearances"),
      value: statistics.length,
      description: t("acrossSeasons", { count: seasonsCount }),
    },
    {
      title: t("totalGoals"),
      value: totalStats.goals,
      description: t("inMinutes", {
        minutes: totalStats.minutesPlayed.toLocaleString(),
      }),
    },
    {
      title: t("totalAssists"),
      value: totalStats.assists,
    },
    {
      title: t("averageRating"),
      value: avgRating ? avgRating.toFixed(1) : "-",
    },
  ];
}

export const groupStatisticsBySeason = (
  statistics: PlayerStatisticsResponseDto[]
): Record<string, PlayerStatisticsResponseDto[]> => {
  return statistics.reduce<Record<string, PlayerStatisticsResponseDto[]>>(
    (acc, stat) => {
      if (!acc[stat.season]) {
        acc[stat.season] = [];
      }
      acc[stat.season]!.push(stat);
      return acc;
    },
    {}
  );
};

export const getGoalsAndAssistsBySeason = (
  statisticsBySeason: Record<string, PlayerStatisticsResponseDto[]>
) => {
  return Object.entries(statisticsBySeason)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([season, stats]) => {
      const totalGoals = stats.reduce((sum, s) => sum + s.goals, 0);
      const totalAssists = stats.reduce((sum, s) => sum + s.assists, 0);
      return {
        season,
        goals: totalGoals,
        assists: totalAssists,
      };
    });
};

export const getPerformanceRatingsBySeason = (
  statisticsBySeason: Record<string, PlayerStatisticsResponseDto[]>
) => {
  return Object.entries(statisticsBySeason)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([season, stats]) => {
      const averageRatingRaw =
        stats.reduce((sum, s) => sum + (s.rating || 0), 0) / stats.length;
      const averageRating = Number(averageRatingRaw.toFixed(1));

      return {
        season,
        rating: averageRating,
      };
    });
};

export const getTotalStatsBySeason = (
  statisticsBySeason: Record<string, PlayerStatisticsResponseDto[]>
): PureStats[] => {
  return Object.entries(statisticsBySeason)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([season, stats]) => {
      const calculatedStats = {
        season,
        minutesPlayed: stats.reduce((sum, s) => sum + s.minutesPlayed, 0),
        goals: stats.reduce((sum, s) => sum + s.goals, 0),
        assists: stats.reduce((sum, s) => sum + s.assists, 0),
        yellowCards: stats.reduce((sum, s) => sum + s.yellowCards, 0),
        redCards: stats.reduce((sum, s) => sum + s.redCards, 0),
        fouls: stats.reduce((sum, s) => sum + s.fouls, 0),
        shotsOnTarget: stats.reduce((sum, s) => sum + s.shotsOnTarget, 0),
        shotsOffTarget: stats.reduce((sum, s) => sum + s.shotsOffTarget, 0),
        savesMade: stats.reduce((sum, s) => sum + s.savesMade, 0),
        goalsConceded: stats.reduce((sum, s) => sum + s.goalsConceded, 0),
        rating: Number(
          (
            stats.reduce((sum, s) => sum + (s.rating || 0), 0) / stats.length
          ).toFixed(1)
        ),
      };

      return {
        ...calculatedStats,
      };
    });
};

export const getSeasonStatsColumns = (
  position: PlayerPosition
): Partial<keyof PureStats>[] => {
  return position === PlayerPosition.GOALKEEPER
    ? [
        "season",
        "minutesPlayed",
        "savesMade",
        "goalsConceded",
        "goals",
        "assists",
        "yellowCards",
        "redCards",
        "rating",
      ]
    : [
        "season",
        "minutesPlayed",
        "goals",
        "assists",
        "yellowCards",
        "redCards",
        "shotsOnTarget",
        "shotsOffTarget",
        "fouls",
        "rating",
      ];
};

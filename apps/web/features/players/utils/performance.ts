import { PlayerPosition } from "@repo/core";
import type {
  PlayerPerformanceSummary,
  PlayerSeasonStatistics,
} from "@repo/core";
import type { PureStats } from "../types/stats";

export function getSummaryCards(
  summary: PlayerPerformanceSummary,
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  const totals = summary.totals;
  return [
    {
      title: t("totalAppearances"),
      value: totals.appearances,
      description: t("acrossSeasons", { count: summary.seasons.length }),
    },
    {
      title: t("totalGoals"),
      value: totals.goals,
      description: t("inMinutes", {
        minutes: totals.minutesPlayed.toLocaleString(),
      }),
    },
    { title: t("totalAssists"), value: totals.assists },
    { title: t("averageRating"), value: totals.rating?.toFixed(1) ?? "-" },
  ];
}

export const getGoalsAndAssistsBySeason = (
  statistics: PlayerSeasonStatistics[],
) =>
  [...statistics]
    .sort((a, b) => a.season.localeCompare(b.season))
    .map(({ season, goals, assists }) => ({ season, goals, assists }));

export const getPerformanceRatingsBySeason = (
  statistics: PlayerSeasonStatistics[],
) =>
  [...statistics]
    .sort((a, b) => a.season.localeCompare(b.season))
    .map(({ season, rating }) => ({
      season,
      rating: rating === null ? null : Number(rating.toFixed(1)),
    }));

export const getTotalStatsBySeason = (
  statistics: PlayerSeasonStatistics[],
): PureStats[] =>
  [...statistics]
    .sort((a, b) => b.season.localeCompare(a.season))
    .map((stat) => ({
      ...stat,
      rating: stat.rating === null ? null : Number(stat.rating.toFixed(1)),
    }));

export const getSeasonStatsColumns = (
  position: PlayerPosition,
): (keyof PureStats)[] =>
  position === PlayerPosition.GOALKEEPER
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

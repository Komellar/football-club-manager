import { MatchEventType, MatchSimulationState } from "@repo/core";

export interface MatchStats {
  goals: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  yellowCards: { home: number; away: number };
}

export function calculateMatchStats(
  activeMatch: MatchSimulationState | null
): MatchStats | null {
  if (!activeMatch) return null;

  const countEvents = (type: MatchEventType, teamId: number) =>
    activeMatch.events.filter((e) => e.type === type && e.teamId === teamId)
      .length;

  return {
    goals: {
      home: countEvents(MatchEventType.GOAL, activeMatch.homeTeam.id),
      away: countEvents(MatchEventType.GOAL, activeMatch.awayTeam.id),
    },
    shotsOnTarget: {
      home: countEvents(MatchEventType.SHOT_ON_TARGET, activeMatch.homeTeam.id),
      away: countEvents(MatchEventType.SHOT_ON_TARGET, activeMatch.awayTeam.id),
    },
    corners: {
      home: countEvents(MatchEventType.CORNER, activeMatch.homeTeam.id),
      away: countEvents(MatchEventType.CORNER, activeMatch.awayTeam.id),
    },
    yellowCards: {
      home: countEvents(MatchEventType.CARD_YELLOW, activeMatch.homeTeam.id),
      away: countEvents(MatchEventType.CARD_YELLOW, activeMatch.awayTeam.id),
    },
  };
}

export const getStatRows = (stats: MatchStats, t: (key: string) => string) => [
  {
    label: t("eventTypes.goal"),
    home: stats.goals.home,
    away: stats.goals.away,
  },
  {
    label: t("eventTypes.shot_on_target"),
    home: stats.shotsOnTarget.home,
    away: stats.shotsOnTarget.away,
  },
  {
    label: t("eventTypes.corner"),
    home: stats.corners.home,
    away: stats.corners.away,
  },
  {
    label: t("eventTypes.card_yellow"),
    home: stats.yellowCards.home,
    away: stats.yellowCards.away,
  },
];

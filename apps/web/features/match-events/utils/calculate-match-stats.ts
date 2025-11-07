import { MatchEventType, MatchSimulationState } from "@repo/core";

export interface MatchStats {
  goals: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  shotsOffTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  offsides: { home: number; away: number };
}

export function calculateMatchStats(
  activeMatch: MatchSimulationState | null
): MatchStats | null {
  if (!activeMatch) return null;

  const countEvents = (type: MatchEventType, teamId: number) =>
    activeMatch.events.filter((e) => e.type === type && e.teamId === teamId)
      .length;

  const homeGoalCount = countEvents(
    MatchEventType.GOAL,
    activeMatch.homeTeam.id
  );
  const awayGoalCount = countEvents(
    MatchEventType.GOAL,
    activeMatch.awayTeam.id
  );

  return {
    goals: {
      home: homeGoalCount,
      away: awayGoalCount,
    },
    shotsOnTarget: {
      home:
        countEvents(MatchEventType.SHOT_ON_TARGET, activeMatch.homeTeam.id) +
        homeGoalCount,
      away:
        countEvents(MatchEventType.SHOT_ON_TARGET, activeMatch.awayTeam.id) +
        awayGoalCount,
    },
    shotsOffTarget: {
      home: countEvents(
        MatchEventType.SHOT_OFF_TARGET,
        activeMatch.homeTeam.id
      ),
      away: countEvents(
        MatchEventType.SHOT_OFF_TARGET,
        activeMatch.awayTeam.id
      ),
    },
    corners: {
      home: countEvents(MatchEventType.CORNER, activeMatch.homeTeam.id),
      away: countEvents(MatchEventType.CORNER, activeMatch.awayTeam.id),
    },
    fouls: {
      home: countEvents(MatchEventType.FOUL, activeMatch.homeTeam.id),
      away: countEvents(MatchEventType.FOUL, activeMatch.awayTeam.id),
    },
    yellowCards: {
      home: countEvents(MatchEventType.CARD_YELLOW, activeMatch.homeTeam.id),
      away: countEvents(MatchEventType.CARD_YELLOW, activeMatch.awayTeam.id),
    },
    redCards: {
      home: countEvents(MatchEventType.CARD_RED, activeMatch.homeTeam.id),
      away: countEvents(MatchEventType.CARD_RED, activeMatch.awayTeam.id),
    },
    offsides: {
      home: countEvents(MatchEventType.OFFSIDE, activeMatch.homeTeam.id),
      away: countEvents(MatchEventType.OFFSIDE, activeMatch.awayTeam.id),
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
    label: t("eventTypes.shot_off_target"),
    home: stats.shotsOffTarget.home,
    away: stats.shotsOffTarget.away,
  },
  {
    label: t("eventTypes.corner"),
    home: stats.corners.home,
    away: stats.corners.away,
  },
  {
    label: t("eventTypes.foul"),
    home: stats.fouls.home,
    away: stats.fouls.away,
  },
  {
    label: t("eventTypes.card_yellow"),
    home: stats.yellowCards.home,
    away: stats.yellowCards.away,
  },
  {
    label: t("eventTypes.card_red"),
    home: stats.redCards.home,
    away: stats.redCards.away,
  },
  {
    label: t("eventTypes.offside"),
    home: stats.offsides.home,
    away: stats.offsides.away,
  },
];

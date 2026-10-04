import { MatchEventType } from "../enums/match-event-type.enum";
import type { MatchEvent } from "../types/match-event";

/** Includes second-yellow dismissals in older reports without an explicit red. */
export function getPlayerDismissalMinute(
  events: MatchEvent[],
  teamId: number,
  playerId: number,
): number | undefined {
  let yellows = 0;
  for (const event of events
    .filter((event) => event.teamId === teamId && event.player?.id === playerId)
    .sort((a, b) => a.minute - b.minute)) {
    if (event.type === MatchEventType.CARD_RED) return event.minute;
    if (event.type === MatchEventType.CARD_YELLOW && ++yellows === 2)
      return event.minute;
  }
  return undefined;
}

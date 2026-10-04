import { randomUUID } from 'crypto';
import {
  MatchEventType,
  PlayerPosition,
  type MatchEvent,
  type MatchSimulationState,
} from '@repo/core';

export function matchState(): MatchSimulationState {
  return {
    matchId: randomUUID(),
    fixtureId: '83ce6cb0-700d-4a39-a647-921c49c6df53',
    homeTeam: {
      id: 1,
      name: 'Home',
      players: Array.from({ length: 11 }, (_, index) => ({
        id: index + 1,
        name: `Player ${index + 1}`,
        position:
          index === 0 ? PlayerPosition.GOALKEEPER : PlayerPosition.FORWARD,
      })),
    },
    awayTeam: {
      id: 2,
      name: 'Away',
      players: Array.from({ length: 11 }, (_, index) => ({
        id: 1001 + index,
        name: `Opponent ${index + 1}`,
        position:
          index === 0 ? PlayerPosition.GOALKEEPER : PlayerPosition.FORWARD,
      })),
    },
    score: { home: 0, away: 0 },
    currentMinute: 90,
    events: [],
    startTime: new Date('2026-07-31T23:59:00Z'),
  };
}

export function matchEvent(
  state: MatchSimulationState,
  type: MatchEventType,
  playerId: number,
  minute: number,
  teamId = state.homeTeam.id,
): MatchEvent {
  const team = teamId === state.homeTeam.id ? state.homeTeam : state.awayTeam;
  return {
    id: randomUUID(),
    matchId: state.matchId,
    type,
    minute,
    timestamp: new Date(),
    teamId,
    teamName: team.name,
    player: team.players?.find((player) => player.id === playerId),
  };
}

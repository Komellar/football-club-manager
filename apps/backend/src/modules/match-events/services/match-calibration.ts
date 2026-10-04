import { randomUUID } from 'crypto';
import {
  MatchEventType,
  MatchSettingsSchema,
  type MatchSettings,
  type MatchSimulationState,
} from '@repo/core';
import { MatchSimulationEngineService } from './match-simulation-engine.service';
import { MATCH_ENGINE_VERSION } from '../constants/match-simulation.constants';

/** Runs the same engine without timers, sockets, or database writes. */
export function simulateSeededMatch(
  seed: string,
  input: Partial<MatchSettings> = {},
): MatchSimulationState {
  const settings = MatchSettingsSchema.parse(input);
  const engine = new MatchSimulationEngineService();
  const state: MatchSimulationState = {
    matchId: randomUUID(),
    seed,
    engineVersion: MATCH_ENGINE_VERSION,
    phase: 'first_half',
    homeTeam: {
      id: 1,
      name: 'Home',
      players: engine
        .createOpponentSquad()
        .map((player, index) => ({ ...player, id: index + 1 })),
      strength: settings.homeStrength,
      tactic: settings.homeTactic,
    },
    awayTeam: {
      id: 2,
      name: 'Away',
      players: engine.createOpponentSquad(),
      strength: settings.opponentStrength,
      tactic: settings.opponentTactic,
    },
    startTime: new Date(),
    currentMinute: 0,
    score: { home: 0, away: 0 },
    events: [],
    possession: { home: 0, away: 0 },
  };
  state.events.push(engine.createMatchEvent(state, MatchEventType.MATCH_START));
  while (!engine.isMatchEnded(state.currentMinute)) {
    engine.advanceTime(state);
    state.phase = state.currentMinute <= 45 ? 'first_half' : 'second_half';
    state.events.push(...engine.generateRandomEvents(state));
    if (engine.isHalfTime(state.currentMinute))
      state.events.push(
        engine.createMatchEvent(state, MatchEventType.HALF_TIME),
      );
  }
  state.events.push(engine.createMatchEvent(state, MatchEventType.MATCH_END));
  state.phase = 'completed';
  return state;
}

export function calibrateMatches(samples = 2000, prefix = 'calibration') {
  if (!Number.isInteger(samples) || samples < 1 || samples > 100000)
    throw new Error('Use 1–100000 samples');
  const totals = {
    goals: 0,
    homeGoals: 0,
    awayGoals: 0,
    shots: 0,
    yellowCards: 0,
    directReds: 0,
    penalties: 0,
  };
  for (let sample = 0; sample < samples; sample++) {
    const state = simulateSeededMatch(`${prefix}:${sample}`);
    totals.goals += state.score.home + state.score.away;
    totals.homeGoals += state.score.home;
    totals.awayGoals += state.score.away;
    for (const event of state.events) {
      if (
        [
          MatchEventType.GOAL,
          MatchEventType.SHOT_ON_TARGET,
          MatchEventType.SHOT_OFF_TARGET,
        ].includes(event.type)
      )
        totals.shots++;
      if (event.type === MatchEventType.CARD_YELLOW) totals.yellowCards++;
      if (event.type === MatchEventType.PENALTY) totals.penalties++;
      if (
        event.type === MatchEventType.CARD_RED &&
        state.events.filter(
          (previous) =>
            previous.type === MatchEventType.CARD_YELLOW &&
            previous.teamId === event.teamId &&
            previous.player?.id === event.player?.id &&
            previous.minute <= event.minute,
        ).length < 2
      )
        totals.directReds++;
    }
  }
  return {
    engineVersion: MATCH_ENGINE_VERSION,
    samples,
    seedPrefix: prefix,
    averages: Object.fromEntries(
      Object.entries(totals).map(([key, value]) => [
        key,
        Number((value / samples).toFixed(4)),
      ]),
    ),
  };
}

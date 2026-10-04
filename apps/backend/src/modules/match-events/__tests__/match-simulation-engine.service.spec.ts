import {
  MatchEventType,
  MatchEventSchema,
  MatchSimulationStateSchema,
  PlayerPosition,
} from '@repo/core';
import { MatchSimulationEngineService } from '../services/match-simulation-engine.service';
import { matchEvent, matchState } from './match-test-data';
import {
  calibrateMatches,
  simulateSeededMatch,
} from '../services/match-calibration';

const sequence =
  (...draws: number[]) =>
  () =>
    draws.shift() ?? 0.9;
const goalDraws = () => sequence(0, 0.9, 0, 0, 0.9, 0, 0, 0, 0);

describe('MatchSimulationEngineService', () => {
  const engine = new MatchSimulationEngineService();
  it('never selects a dismissed player as scorer or assistant', () => {
    const state = matchState();
    state.events = [matchEvent(state, MatchEventType.CARD_RED, 2, 12)];
    const [goal] = engine.generateRandomEvents(state, goalDraws());
    expect(goal).toMatchObject({
      type: MatchEventType.GOAL,
      player: { id: 3 },
      relatedPlayer: { id: 4 },
    });
    expect(state.score.home).toBe(1);
    expect(state.homeTeam.players).toHaveLength(11);
  });
  it('links fouls to a second yellow and red, then excludes that player', () => {
    const state = matchState();
    state.events = [matchEvent(state, MatchEventType.CARD_YELLOW, 2, 12)];
    const events = engine.generateRandomEvents(
      state,
      sequence(0.99, 0, 0.1, 0.1, 0.9),
    );
    expect(events.map((event) => event.type)).toEqual([
      MatchEventType.FOUL,
      MatchEventType.CARD_YELLOW,
      MatchEventType.CARD_RED,
    ]);
    expect(events[2].player?.id).toBe(2);
    expect(new Set(events.map((event) => event.playId)).size).toBe(1);
    state.events.push(...events);
    expect(engine.generateRandomEvents(state, goalDraws())[0].player?.id).toBe(
      3,
    );
  });
  it('uses stable away identities and permits away assists', () => {
    const state = matchState();
    const [goal] = engine.generateRandomEvents(
      state,
      sequence(0.99, 0.9, 0, 0, 0.9, 0, 0, 0, 0),
    );
    expect(goal).toMatchObject({
      teamId: 2,
      player: state.awayTeam.players![1],
      relatedPlayer: state.awayTeam.players![2],
    });
  });
  it('excludes legacy second-yellow dismissals on the away side', () => {
    const state = matchState();
    state.events = [
      matchEvent(state, MatchEventType.CARD_YELLOW, 1002, 12, 2),
      matchEvent(state, MatchEventType.CARD_YELLOW, 1002, 30, 2),
    ];
    expect(
      engine.generateRandomEvents(
        state,
        sequence(0.99, 0.9, 0, 0, 0.9, 0, 0, 0, 0),
      )[0].player?.id,
    ).toBe(1003);
  });
  it('does not assign an assist when no eligible outfield teammate exists', () => {
    const state = matchState();
    state.events = state.homeTeam.players
      .slice(2)
      .map((player) =>
        matchEvent(state, MatchEventType.CARD_RED, player.id, 12),
      );
    expect(
      engine.generateRandomEvents(state, goalDraws())[0].relatedPlayer,
    ).toBeUndefined();
  });
  it('returns no event when neither side has an eligible player', () => {
    const state = matchState();
    state.events = [
      ...state.homeTeam.players.map((p) =>
        matchEvent(state, MatchEventType.CARD_RED, p.id, 12),
      ),
      ...state.awayTeam.players!.map((p) =>
        matchEvent(state, MatchEventType.CARD_RED, p.id, 12, 2),
      ),
    ];
    expect(engine.generateRandomEvents(state)).toEqual([]);
  });
  it.each([
    [0, 'scored', MatchEventType.GOAL, 1],
    [0.8, 'saved', MatchEventType.SHOT_ON_TARGET, 0],
    [0.99, 'missed', MatchEventType.SHOT_OFF_TARGET, 0],
  ])(
    'resolves a penalty outcome exactly once (%s)',
    (draw, outcome, shotType, goals) => {
      const state = matchState();
      const events = engine.generateRandomEvents(
        state,
        sequence(0, 0, 0.5, 0.9, 0, 0, Number(draw), 0),
      );
      expect(events.map((event) => event.type)).toEqual([
        MatchEventType.FOUL,
        MatchEventType.PENALTY,
        shotType,
      ]);
      expect(events[1].penaltyOutcome).toBe(outcome);
      expect(events[2]).toMatchObject({
        isPenalty: true,
        playId: events[1].playId,
      });
      expect(events[2].relatedPlayer).toBeUndefined();
      expect(state.score.home).toBe(goals);
      events.forEach((event) =>
        expect(MatchEventSchema.safeParse(event).success).toBe(true),
      );
    },
  );
  it('creates neutral lifecycle events and rejects incomplete play payloads', () => {
    const state = matchState();
    const event = engine.createMatchEvent(state, MatchEventType.MATCH_END);
    expect(event.teamId).toBeUndefined();
    expect(event.teamName).toBeUndefined();
    expect(MatchEventSchema.safeParse(event).success).toBe(true);
    expect(
      MatchEventSchema.safeParse({ ...event, type: MatchEventType.GOAL })
        .success,
    ).toBe(false);
  });
  it('hydrates saved JSON dates and accepts older reports without new metadata', () => {
    const state = matchState();
    state.events.push(matchEvent(state, MatchEventType.GOAL, 2, 12));
    delete state.awayTeam.players;
    const parsed = MatchSimulationStateSchema.parse(
      JSON.parse(JSON.stringify(state)),
    );
    expect(parsed.startTime).toBeInstanceOf(Date);
    expect(parsed.events[0].timestamp).toBeInstanceOf(Date);
  });
  it('replays the same football outcomes from the stored seed', () => {
    const summarize = (state: ReturnType<typeof simulateSeededMatch>) => ({
      score: state.score,
      possession: state.possession,
      events: state.events.map(
        ({ type, minute, teamId, player, relatedPlayer, penaltyOutcome }) => ({
          type,
          minute,
          teamId,
          player,
          relatedPlayer,
          penaltyOutcome,
        }),
      ),
    });
    expect(summarize(simulateSeededMatch('replay'))).toEqual(
      summarize(simulateSeededMatch('replay')),
    );
    expect(summarize(simulateSeededMatch('different'))).not.toEqual(
      summarize(simulateSeededMatch('replay')),
    );
  });
  it('never gives goalkeeper attacking events across seeded matches', () => {
    for (let sample = 0; sample < 100; sample++) {
      const state = simulateSeededMatch(`roles:${sample}`);
      for (const event of state.events.filter((event) =>
        [
          MatchEventType.GOAL,
          MatchEventType.SHOT_ON_TARGET,
          MatchEventType.SHOT_OFF_TARGET,
        ].includes(event.type),
      ))
        expect(event.player?.position).not.toBe(PlayerPosition.GOALKEEPER);
      expect(state.possession!.home + state.possession!.away).toBe(90);
      expect(state.score.home + state.score.away).toBe(
        state.events.filter((event) => event.type === MatchEventType.GOAL)
          .length,
      );
    }
  });
  it('makes strength and tactics affect outcomes', () => {
    const totals = (homeStrength: number, opponentStrength: number) =>
      Array.from({ length: 150 }, (_, sample) =>
        simulateSeededMatch(`strength:${sample}`, {
          homeStrength,
          opponentStrength,
        }),
      ).reduce((sum, state) => sum + state.score.home - state.score.away, 0);
    expect(totals(1.5, 0.5)).toBeGreaterThan(totals(0.5, 1.5));
    const attack = simulateSeededMatch('tactics', { homeTactic: 'attacking' });
    const defend = simulateSeededMatch('tactics', { homeTactic: 'defensive' });
    expect(attack.events.map((event) => event.type)).not.toEqual(
      defend.events.map((event) => event.type),
    );
  });
  it('uses the selected formation to change the chance distribution', () => {
    const chances = (forwards: boolean) => {
      let shots = 0;
      for (let sample = 0; sample < 150; sample++) {
        const state = matchState();
        state.seed = `formation:${sample}`;
        state.events = [];
        state.currentMinute = 0;
        state.homeTeam.players = engine
          .createOpponentSquad()
          .map((player, index) => ({
            ...player,
            id: index + 1,
            position:
              index === 0
                ? PlayerPosition.GOALKEEPER
                : forwards
                  ? PlayerPosition.FORWARD
                  : PlayerPosition.DEFENDER,
          }));
        state.awayTeam.players = engine.createOpponentSquad();
        for (let minute = 1; minute <= 90; minute++) {
          state.currentMinute = minute;
          const events = engine.generateRandomEvents(state);
          state.events.push(...events);
          shots += events.filter(
            (event) =>
              event.teamId === 1 &&
              [
                MatchEventType.GOAL,
                MatchEventType.SHOT_ON_TARGET,
                MatchEventType.SHOT_OFF_TARGET,
              ].includes(event.type),
          ).length;
        }
      }
      return shots;
    };
    expect(chances(true)).toBeGreaterThan(chances(false));
  });
  it('keeps a fixed seed batch within documented balancing ranges', () => {
    const { averages } = calibrateMatches(1000, 'regression');
    expect(averages.goals).toBeGreaterThan(2);
    expect(averages.goals).toBeLessThan(4);
    expect(averages.directReds).toBeGreaterThan(0.02);
    expect(averages.directReds).toBeLessThan(0.2);
    expect(averages.shots).toBeGreaterThan(18);
    expect(averages.shots).toBeLessThan(30);
    expect(averages.yellowCards).toBeGreaterThan(2);
    expect(averages.yellowCards).toBeLessThan(5);
  });
});

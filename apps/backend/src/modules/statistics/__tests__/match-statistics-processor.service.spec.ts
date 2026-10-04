import { CreatePlayerStatisticsSchema, MatchEventType } from '@repo/core';
import { MatchStatisticsProcessorService } from '../services/match-statistics-processor.service';
import {
  matchEvent,
  matchState,
} from '../../match-events/__tests__/match-test-data';

describe('MatchStatisticsProcessorService', () => {
  const service = new MatchStatisticsProcessorService();

  it('calculates a row for each starter, including players without events', () => {
    const state = matchState();
    state.currentMinute = 120;
    const rows = service.calculateMatchStatistics(state, '2025-2026');
    expect(rows).toHaveLength(11);
    expect(rows.every((row) => row.minutesPlayed === 120)).toBe(true);
    expect(rows[0]).toMatchObject({ goals: 0, assists: 0, rating: 6 });
    for (const row of rows)
      expect(CreatePlayerStatisticsSchema.parse(row)).toEqual(row);
  });

  it('counts goals as shots on target and credits assists to a different player', () => {
    const state = matchState();
    const goal = matchEvent(state, MatchEventType.GOAL, 2, 12);
    goal.relatedPlayer = state.homeTeam.players[2];
    state.events = [goal, matchEvent(state, MatchEventType.CARD_YELLOW, 2, 20)];
    const rows = service.calculateMatchStatistics(state, '2025-2026');
    expect(rows[1]).toMatchObject({
      goals: 1,
      shotsOnTarget: 1,
      yellowCards: 1,
      rating: 6.7,
    });
    expect(rows[2]).toMatchObject({ assists: 1, goals: 0 });
    goal.relatedPlayer = goal.player;
    expect(
      service.calculateMatchStatistics(state, '2025-2026')[1].assists,
    ).toBe(0);
  });

  it('uses dismissal time and counts a second-yellow red once', () => {
    const state = matchState();
    state.events = [
      matchEvent(state, MatchEventType.CARD_YELLOW, 2, 12),
      matchEvent(state, MatchEventType.CARD_YELLOW, 2, 62),
      matchEvent(state, MatchEventType.CARD_RED, 2, 62),
      matchEvent(state, MatchEventType.CARD_YELLOW, 2, 80),
      matchEvent(state, MatchEventType.GOAL, 2, 85),
    ];
    expect(
      service.calculateMatchStatistics(state, '2025-2026')[1],
    ).toMatchObject({
      minutesPlayed: 62,
      yellowCards: 2,
      redCards: 1,
      goals: 0,
    });
    state.events = state.events.filter(
      (event) => event.type !== MatchEventType.CARD_RED,
    );
    expect(
      service.calculateMatchStatistics(state, '2025-2026')[1],
    ).toMatchObject({
      minutesPlayed: 62,
      yellowCards: 2,
      redCards: 1,
    });
  });

  it('limits goalkeeper saves and conceded goals to time on the pitch', () => {
    const state = matchState();
    state.events = [
      matchEvent(state, MatchEventType.SHOT_ON_TARGET, 1002, 10, 2),
      matchEvent(state, MatchEventType.GOAL, 1002, 20, 2),
      matchEvent(state, MatchEventType.CARD_RED, 1, 45),
      matchEvent(state, MatchEventType.SHOT_ON_TARGET, 1002, 60, 2),
      matchEvent(state, MatchEventType.GOAL, 1002, 70, 2),
    ];
    expect(
      service.calculateMatchStatistics(state, '2025-2026')[0],
    ).toMatchObject({
      minutesPlayed: 45,
      savesMade: 1,
      goalsConceded: 1,
      redCards: 1,
    });
    expect(
      service.calculateMatchStatistics(state, '2025-2026')[1],
    ).toMatchObject({
      savesMade: 0,
      goalsConceded: 0,
    });
  });

  it('handles a dismissal at minute zero', () => {
    const state = matchState();
    state.events = [matchEvent(state, MatchEventType.CARD_RED, 2, 0)];
    expect(
      service.calculateMatchStatistics(state, '2025-2026')[1].minutesPlayed,
    ).toBe(0);
  });

  it('counts fouls and missed shots and rounds ratings to the shared contract', () => {
    const state = matchState();
    state.events = [
      matchEvent(state, MatchEventType.SHOT_ON_TARGET, 2, 10),
      matchEvent(state, MatchEventType.SHOT_OFF_TARGET, 2, 20),
      matchEvent(state, MatchEventType.FOUL, 2, 30),
    ];
    const row = service.calculateMatchStatistics(state, '2025-2026')[1];
    expect(row).toMatchObject({
      shotsOnTarget: 1,
      shotsOffTarget: 1,
      fouls: 1,
      rating: 6.2,
    });
    expect(CreatePlayerStatisticsSchema.safeParse(row).success).toBe(true);
  });
});

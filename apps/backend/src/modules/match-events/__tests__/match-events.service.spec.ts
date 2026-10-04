import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MatchEventType, PlayerPosition, type StartMatch } from '@repo/core';
import { MatchEventsService } from '../services/match-events.service';
import { MatchSimulationEngineService } from '../services/match-simulation-engine.service';
import { FixturesService } from '../services/fixtures.service';
import {
  MATCH_INTERNAL_ENDED,
  MATCH_INTERNAL_EVENT,
  MATCH_INTERNAL_STATE,
  MATCH_SIMULATION_CONFIG,
} from '../constants/match-simulation.constants';

const matchData: StartMatch = {
  homeTeam: {
    id: 1,
    name: 'Home Team',
    players: Array.from({ length: 11 }, (_, index) => ({
      id: index + 1,
      name: `Player ${index + 1}`,
      position: PlayerPosition.FORWARD,
    })),
  },
  awayTeam: { id: 2, name: 'Away Team' },
};

describe('MatchEventsService', () => {
  let service: MatchEventsService;
  let simulationEngine: MatchSimulationEngineService;
  let eventEmitter: EventEmitter2;
  let fixtures: FixturesService;

  beforeEach(async () => {
    jest.useFakeTimers();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchEventsService,
        MatchSimulationEngineService,
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        {
          provide: FixturesService,
          useValue: {
            claim: jest.fn(),
            complete: jest.fn().mockResolvedValue(undefined),
            interrupt: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(MatchEventsService);
    simulationEngine = module.get(MatchSimulationEngineService);
    jest.spyOn(simulationEngine, 'generateRandomEvents').mockReturnValue([]);
    eventEmitter = module.get(EventEmitter2);
    fixtures = module.get(FixturesService);
  });

  afterEach(() => {
    service.onModuleDestroy();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('subscribes clients to the single active match', () => {
    expect(service.subscribeToMatch('client-1')).toBeNull();
    const matchId = service.startMatchSimulation(matchData);
    expect(service.subscribeToMatch('client-1')).toBe(matchId);
    expect(service.getActiveMatchId()).toBe(matchId);
    expect(service.isMatchActive()).toBe(true);
  });

  it('generates a match ID and emits a start event', () => {
    const matchId = service.startMatchSimulation(matchData);
    expect(matchId).toMatch(/^[0-9a-f-]{36}$/);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      MATCH_INTERNAL_EVENT,
      expect.objectContaining({
        type: MatchEventType.MATCH_START,
        matchId,
      }),
    );
  });

  it('rejects a second match until the active match is cleared', () => {
    service.startMatchSimulation(matchData);
    expect(() => service.startMatchSimulation(matchData)).toThrow(
      'A match is already running',
    );
    service.onModuleDestroy();
    expect(service.isMatchActive()).toBe(false);
  });

  it('emits generated events on simulation ticks', async () => {
    const matchId = service.startMatchSimulation(matchData);
    jest
      .spyOn(simulationEngine, 'generateRandomEvents')
      .mockImplementation((state) => [
        {
          id: 'event-1',
          matchId: state.matchId,
          type: MatchEventType.GOAL,
          minute: state.currentMinute,
          timestamp: new Date(),
          teamId: state.homeTeam.id,
          teamName: state.homeTeam.name,
          player: state.homeTeam.players[0],
        },
      ]);

    await jest.advanceTimersByTimeAsync(
      MATCH_SIMULATION_CONFIG.TICK_INTERVAL_MS,
    );

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      MATCH_INTERNAL_EVENT,
      expect.objectContaining({
        type: MatchEventType.GOAL,
        matchId,
        minute: MATCH_SIMULATION_CONFIG.MINUTES_PER_TICK,
      }),
    );
  });

  it('emits the result when the match ends', async () => {
    const matchId = service.startMatchSimulation(matchData);
    jest.spyOn(simulationEngine, 'isMatchEnded').mockReturnValue(true);

    await jest.advanceTimersByTimeAsync(
      MATCH_SIMULATION_CONFIG.TICK_INTERVAL_MS,
    );

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      MATCH_INTERNAL_ENDED,
      expect.objectContaining({ matchId, score: { home: 0, away: 0 } }),
    );
    expect(service.isMatchActive()).toBe(false);
  });

  it('keeps the result and retries a failed save before publishing completion', async () => {
    const fixtureId = '83ce6cb0-700d-4a39-a647-921c49c6df53';
    jest
      .spyOn(fixtures, 'complete')
      .mockRejectedValueOnce(new Error('Database unavailable'))
      .mockResolvedValue(undefined);
    service.startMatchSimulation({ ...matchData, fixtureId });
    jest.spyOn(simulationEngine, 'isMatchEnded').mockReturnValue(true);
    await jest.advanceTimersByTimeAsync(
      MATCH_SIMULATION_CONFIG.TICK_INTERVAL_MS,
    );
    expect(service.isMatchActive()).toBe(true);
    expect(service.getActiveMatch()?.phase).toBe('saving');
    expect(fixtures.complete).toHaveBeenCalledWith(
      fixtureId,
      expect.objectContaining({ phase: 'completed' }),
    );
    expect(
      jest
        .mocked(eventEmitter.emit)
        .mock.calls.some(([name]) => name === MATCH_INTERNAL_ENDED),
    ).toBe(false);
    await jest.advanceTimersByTimeAsync(5000);
    expect(service.isMatchActive()).toBe(false);
    expect(fixtures.complete).toHaveBeenCalledTimes(2);
    const endEvents = jest
      .mocked(eventEmitter.emit)
      .mock.calls.filter(([name]) => name === MATCH_INTERNAL_ENDED);
    expect(endEvents).toHaveLength(1);
  });

  it('broadcasts the clock even when no football event occurs', async () => {
    service.startMatchSimulation(matchData);
    await jest.advanceTimersByTimeAsync(
      MATCH_SIMULATION_CONFIG.TICK_INTERVAL_MS,
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      MATCH_INTERNAL_STATE,
      expect.objectContaining({
        currentMinute: 3,
        phase: 'first_half',
        seed: expect.any(String),
        engineVersion: '2.0',
      }),
    );
  });

  it('pauses at halftime and processes the 90th minute before completion', async () => {
    service.startMatchSimulation(matchData);
    await jest.advanceTimersByTimeAsync(
      15 * MATCH_SIMULATION_CONFIG.TICK_INTERVAL_MS,
    );
    expect(service.getActiveMatch()).toMatchObject({
      currentMinute: 45,
      phase: 'half_time',
    });
    await jest.advanceTimersByTimeAsync(
      MATCH_SIMULATION_CONFIG.TICK_INTERVAL_MS,
    );
    expect(service.getActiveMatch()).toMatchObject({
      currentMinute: 48,
      phase: 'second_half',
    });
    await jest.advanceTimersByTimeAsync(
      14 * MATCH_SIMULATION_CONFIG.TICK_INTERVAL_MS,
    );
    expect(service.isMatchActive()).toBe(false);
    expect(
      jest.mocked(simulationEngine.generateRandomEvents),
    ).toHaveBeenCalledTimes(90);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      MATCH_INTERNAL_STATE,
      expect.objectContaining({ currentMinute: 90, phase: 'completed' }),
    );
  });

  it('snapshots a stable eleven-player away squad at kickoff', () => {
    service.startMatchSimulation(matchData);
    const players = service.getActiveMatch()!.awayTeam.players!;
    expect(players).toHaveLength(11);
    expect(new Set(players.map((player) => player.id)).size).toBe(11);
    expect(
      players.filter((player) => player.position === PlayerPosition.GOALKEEPER),
    ).toHaveLength(1);
  });
});

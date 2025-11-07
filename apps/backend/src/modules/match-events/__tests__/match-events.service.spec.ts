import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MatchEventsService } from '../services/match-events.service';
import { MatchSimulationEngineService } from '../services/match-simulation-engine.service';
import { MatchStatisticsProcessorService } from '../../statistics/services/match-statistics-processor.service';
import { MatchEventType, PlayerPosition, StartMatch } from '@repo/core';
import { Server } from 'socket.io';

// Mock uuid module
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-v4'),
}));

describe('MatchEventsService (RxJS)', () => {
  let service: MatchEventsService;
  let simulationEngine: MatchSimulationEngineService;
  let statisticsProcessor: MatchStatisticsProcessorService;
  let mockServer: Partial<Server>;
  let logSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Setup logger spies BEFORE creating the module
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

    // Create mock server
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchEventsService,
        MatchSimulationEngineService,
        {
          provide: MatchStatisticsProcessorService,
          useValue: {
            processMatchEvents: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<MatchEventsService>(MatchEventsService);
    simulationEngine = module.get<MatchSimulationEngineService>(
      MatchSimulationEngineService,
    );
    statisticsProcessor = module.get<MatchStatisticsProcessorService>(
      MatchStatisticsProcessorService,
    );

    service.setServer(mockServer as Server);
  });

  afterEach(() => {
    // Clean up any active matches to prevent memory leaks
    service.onModuleDestroy();
    jest.restoreAllMocks();
  });

  describe('Client Subscription Management', () => {
    it('should subscribe a client to a match', () => {
      const clientId = 'client-1';
      const matchId = 1;

      service.subscribeToMatch(clientId, matchId);

      expect(Logger.prototype.log).toHaveBeenCalledWith(
        `Client ${clientId} subscribed to match ${matchId}`,
      );
    });

    it('should unsubscribe a client from a match', () => {
      const clientId = 'client-1';
      const matchId = 1;

      service.subscribeToMatch(clientId, matchId);
      service.unsubscribeFromMatch(clientId, matchId);

      expect(logSpy).toHaveBeenCalledWith(
        `Client ${clientId} unsubscribed from match ${matchId}`,
      );
    });

    it('should handle client disconnect and clean up subscriptions', () => {
      const clientId = 'client-1';
      const matchId = 1;

      service.subscribeToMatch(clientId, matchId);
      service.handleClientDisconnect(clientId);

      expect(logSpy).toHaveBeenCalledWith(
        `Cleaning up subscriptions for disconnected client ${clientId}`,
      );
    });
  });

  describe('Match Simulation with RxJS', () => {
    const createMockMatchData = (): StartMatch => ({
      matchId: 1,
      homeTeam: {
        id: 1,
        name: 'Home Team',
        players: [
          {
            id: 1,
            name: 'Player 1',
            position: PlayerPosition.FORWARD,
            jerseyNumber: 10,
          },
          {
            id: 2,
            name: 'Player 2',
            position: PlayerPosition.MIDFIELDER,
            jerseyNumber: 8,
          },
        ],
      },
      awayTeam: {
        id: 2,
        name: 'Away Team',
      },
    });

    it('should start a match simulation and create RxJS stream', () => {
      const matchData = createMockMatchData();

      service.startMatchSimulation(matchData);

      expect(service.isMatchActive(matchData.matchId)).toBe(true);
      expect(mockServer.to).toHaveBeenCalledWith(`match:${matchData.matchId}`);
      expect(mockServer.emit).toHaveBeenCalledWith(
        'matchEvent',
        expect.objectContaining({
          type: MatchEventType.MATCH_START,
          matchId: matchData.matchId,
        }),
      );
    });

    it('should throw error if match is already active', () => {
      const matchData = createMockMatchData();

      service.startMatchSimulation(matchData);

      expect(() => service.startMatchSimulation(matchData)).toThrow(
        `Match ${matchData.matchId} is already running`,
      );
    });

    it('should clean up RxJS subscriptions on module destroy', () => {
      const matchData = createMockMatchData();

      service.startMatchSimulation(matchData);
      expect(service.isMatchActive(matchData.matchId)).toBe(true);

      // Call lifecycle hook
      service.onModuleDestroy();

      expect(service.isMatchActive(matchData.matchId)).toBe(false);
    });
  });

  describe('Event Stream Processing', () => {
    it('should process match events through reactive streams', (done) => {
      const matchData: StartMatch = {
        matchId: 1,
        homeTeam: {
          id: 1,
          name: 'Home Team',
          players: [
            {
              id: 1,
              name: 'Player 1',
              position: PlayerPosition.FORWARD,
              jerseyNumber: 10,
            },
          ],
        },
        awayTeam: {
          id: 2,
          name: 'Away Team',
        },
      };

      // Mock event generation to always generate a goal
      jest.spyOn(simulationEngine, 'shouldGenerateEvent').mockReturnValue(true);
      jest.spyOn(simulationEngine, 'generateRandomEvent').mockReturnValue({
        id: 'event-1',
        matchId: 1,
        type: MatchEventType.GOAL,
        minute: 10,
        timestamp: new Date(),
        teamId: 1,
        teamName: 'Home Team',
        player: {
          id: 1,
          name: 'Player 1',
          position: PlayerPosition.FORWARD,
        },
      });

      service.startMatchSimulation(matchData);

      // Wait for a tick to process
      setTimeout(() => {
        expect(mockServer.emit).toHaveBeenCalledWith(
          'matchEvent',
          expect.objectContaining({
            type: MatchEventType.GOAL,
            minute: 10,
          }),
        );

        // Clean up
        service.onModuleDestroy();
        done();
      }, 1100); // Wait for at least one interval tick
    }, 3000);
  });

  describe('Match End and Statistics Processing', () => {
    it('should process statistics when match ends', async () => {
      const matchData: StartMatch = {
        matchId: 1,
        homeTeam: {
          id: 1,
          name: 'Home Team',
          players: [
            {
              id: 1,
              name: 'Player 1',
              position: PlayerPosition.FORWARD,
              jerseyNumber: 10,
            },
          ],
        },
        awayTeam: {
          id: 2,
          name: 'Away Team',
        },
      };

      // Mock match to end immediately
      jest.spyOn(simulationEngine, 'isMatchEnded').mockReturnValue(true);

      service.startMatchSimulation(matchData);

      // Wait for match to end
      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(statisticsProcessor.processMatchEvents).toHaveBeenCalled();
      expect(mockServer.emit).toHaveBeenCalledWith(
        'matchEnded',
        expect.objectContaining({
          matchId: matchData.matchId,
        }),
      );
      expect(service.isMatchActive(matchData.matchId)).toBe(false);

      // Clean up
      service.onModuleDestroy();
    }, 3000);
  });
});

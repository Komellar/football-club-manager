import { Test, TestingModule } from '@nestjs/testing';
import { MatchStatisticsProcessorService } from '../services/match-statistics-processor.service';
import { PlayerStatisticsService } from '../services/player-statistics.service';
import {
  MatchEvent,
  MatchEventType,
  PlayerPosition,
  MatchSimulationState,
} from '@repo/core';

describe('MatchStatisticsProcessorService', () => {
  let service: MatchStatisticsProcessorService;
  let playerStatisticsService: jest.Mocked<PlayerStatisticsService>;

  const mockPlayerStatisticsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchStatisticsProcessorService,
        {
          provide: PlayerStatisticsService,
          useValue: mockPlayerStatisticsService,
        },
      ],
    }).compile();

    service = module.get<MatchStatisticsProcessorService>(
      MatchStatisticsProcessorService,
    );
    playerStatisticsService = module.get(PlayerStatisticsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processMatchEvents', () => {
    it('should process empty events array without errors', async () => {
      const matchState: MatchSimulationState = {
        matchId: 1,
        homeTeam: {
          id: 1,
          name: 'Team A',
          players: [],
        },
        awayTeam: {
          id: 2,
          name: 'Team B',
        },
        score: { home: 0, away: 0 },
        currentMinute: 0,
        events: [],
        startTime: new Date(),
      };
      await service.processMatchEvents(matchState, '2024-2025');
      expect(playerStatisticsService.create).not.toHaveBeenCalled();
    });

    it('should create new statistics for player', async () => {
      const events: MatchEvent[] = [
        {
          id: '1',
          matchId: 1,
          type: MatchEventType.GOAL,
          minute: 10,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: {
            id: 1,
            name: 'Player 1',
            jerseyNumber: 10,
            position: PlayerPosition.FORWARD,
          },
        },
        {
          id: '2',
          matchId: 1,
          type: MatchEventType.CARD_YELLOW,
          minute: 20,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: {
            id: 1,
            name: 'Player 1',
            jerseyNumber: 10,
            position: PlayerPosition.FORWARD,
          },
        },
      ];

      const matchState: MatchSimulationState = {
        matchId: 1,
        homeTeam: {
          id: 1,
          name: 'Team A',
          players: [
            {
              id: 1,
              name: 'Player 1',
              jerseyNumber: 10,
              position: PlayerPosition.FORWARD,
            },
          ],
        },
        awayTeam: {
          id: 2,
          name: 'Team B',
        },
        score: { home: 1, away: 0 },
        currentMinute: 90,
        events,
        startTime: new Date(),
      };

      playerStatisticsService.create.mockResolvedValue({
        id: 1,
        playerId: 1,
        season: '2024-2025',
        goals: 1,
        assists: 0,
        yellowCards: 1,
        redCards: 0,
        minutesPlayed: 90,
        savesMade: 0,
        goalsConceded: 0,
        fouls: 0,
        shotsOffTarget: 0,
        shotsOnTarget: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.processMatchEvents(matchState, '2024-2025');

      expect(playerStatisticsService.create).toHaveBeenCalledWith({
        playerId: 1,
        season: '2024-2025',
        minutesPlayed: 90,
        goals: 1,
        assists: 0,
        yellowCards: 1,
        redCards: 0,
        savesMade: 0,
        goalsConceded: 0,
        fouls: 0,
        shotsOffTarget: 0,
        shotsOnTarget: 1, // 1 goal counts as 1 shot on target
        rating: 6.7,
      });
    });

    it('should create statistics for all players in squad', async () => {
      const events: MatchEvent[] = [
        {
          id: '1',
          matchId: 1,
          type: MatchEventType.GOAL,
          minute: 10,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: {
            id: 1,
            name: 'Player 1',
            jerseyNumber: 10,
            position: PlayerPosition.FORWARD,
          },
        },
        {
          id: '2',
          matchId: 1,
          type: MatchEventType.GOAL,
          minute: 30,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: {
            id: 1,
            name: 'Player 1',
            jerseyNumber: 10,
            position: PlayerPosition.FORWARD,
          },
        },
      ];

      const matchState: MatchSimulationState = {
        matchId: 1,
        homeTeam: {
          id: 1,
          name: 'Team A',
          players: [
            {
              id: 1,
              name: 'Player 1',
              jerseyNumber: 10,
              position: PlayerPosition.FORWARD,
            },
            {
              id: 2,
              name: 'Player 2',
              jerseyNumber: 11,
              position: PlayerPosition.MIDFIELDER,
            },
          ],
        },
        awayTeam: {
          id: 2,
          name: 'Team B',
        },
        score: { home: 2, away: 0 },
        currentMinute: 90,
        events,
        startTime: new Date(),
      };

      playerStatisticsService.create.mockResolvedValue({
        id: 1,
        playerId: 1,
        season: '2024-2025',
        goals: 2,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        minutesPlayed: 90,
        savesMade: 0,
        goalsConceded: 0,
        fouls: 0,
        shotsOffTarget: 0,
        shotsOnTarget: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.processMatchEvents(matchState, '2024-2025');

      // Should create statistics for both players
      expect(playerStatisticsService.create).toHaveBeenCalledTimes(2);

      // Player 1 with 2 goals
      expect(playerStatisticsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          goals: 2,
        }),
      );

      // Player 2 with no events
      expect(playerStatisticsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 2,
          goals: 0,
        }),
      );
    });

    it('should handle multiple players in same match', async () => {
      const events: MatchEvent[] = [
        {
          id: '1',
          matchId: 1,
          type: MatchEventType.GOAL,
          minute: 10,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: {
            id: 1,
            name: 'Player 1',
            jerseyNumber: 10,
            position: PlayerPosition.FORWARD,
          },
        },
        {
          id: '2',
          matchId: 1,
          type: MatchEventType.GOAL,
          minute: 20,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: {
            id: 2,
            name: 'Player 2',
            jerseyNumber: 9,
            position: PlayerPosition.FORWARD,
          },
        },
      ];

      const matchState: MatchSimulationState = {
        matchId: 1,
        homeTeam: {
          id: 1,
          name: 'Team A',
          players: [
            {
              id: 1,
              name: 'Player 1',
              jerseyNumber: 10,
              position: PlayerPosition.FORWARD,
            },
            {
              id: 2,
              name: 'Player 2',
              jerseyNumber: 9,
              position: PlayerPosition.FORWARD,
            },
          ],
        },
        awayTeam: {
          id: 2,
          name: 'Team B',
        },
        score: { home: 2, away: 0 },
        currentMinute: 90,
        events,
        startTime: new Date(),
      };

      await service.processMatchEvents(matchState, '2024-2025');

      expect(playerStatisticsService.create).toHaveBeenCalledTimes(2);
    });

    it('should handle events without players', async () => {
      const events: MatchEvent[] = [
        {
          id: '1',
          matchId: 1,
          type: MatchEventType.MATCH_START,
          minute: 0,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
        },
        {
          id: '2',
          matchId: 1,
          type: MatchEventType.CORNER,
          minute: 10,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
        },
      ];

      const matchState: MatchSimulationState = {
        matchId: 1,
        homeTeam: {
          id: 1,
          name: 'Team A',
          players: [
            {
              id: 1,
              name: 'Player 1',
              jerseyNumber: 10,
              position: PlayerPosition.FORWARD,
            },
          ],
        },
        awayTeam: {
          id: 2,
          name: 'Team B',
        },
        score: { home: 0, away: 0 },
        currentMinute: 90,
        events,
        startTime: new Date(),
      };

      await service.processMatchEvents(matchState, '2024-2025');

      // Should still create stats for player in squad
      expect(playerStatisticsService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle red card events', async () => {
      const events: MatchEvent[] = [
        {
          id: '1',
          matchId: 1,
          type: MatchEventType.CARD_RED,
          minute: 45,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: {
            id: 1,
            name: 'Player 1',
            jerseyNumber: 10,
            position: PlayerPosition.FORWARD,
          },
        },
      ];

      const matchState: MatchSimulationState = {
        matchId: 1,
        homeTeam: {
          id: 1,
          name: 'Team A',
          players: [
            {
              id: 1,
              name: 'Player 1',
              jerseyNumber: 10,
              position: PlayerPosition.FORWARD,
            },
          ],
        },
        awayTeam: {
          id: 2,
          name: 'Team B',
        },
        score: { home: 0, away: 0 },
        currentMinute: 90,
        events,
        startTime: new Date(),
      };

      await service.processMatchEvents(matchState, '2024-2025');

      expect(playerStatisticsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          redCards: 1,
          yellowCards: 0,
          goals: 0,
        }),
      );
    });

    it('should continue processing other players if one fails', async () => {
      // Suppress expected error logs for this test
      jest.spyOn(service['logger'], 'error').mockImplementation();

      const events: MatchEvent[] = [
        {
          id: '1',
          matchId: 1,
          type: MatchEventType.GOAL,
          minute: 10,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: {
            id: 1,
            name: 'Player 1',
            jerseyNumber: 10,
            position: PlayerPosition.FORWARD,
          },
        },
        {
          id: '2',
          matchId: 1,
          type: MatchEventType.GOAL,
          minute: 20,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: {
            id: 2,
            name: 'Player 2',
            jerseyNumber: 9,
            position: PlayerPosition.FORWARD,
          },
        },
      ];

      const matchState: MatchSimulationState = {
        matchId: 1,
        homeTeam: {
          id: 1,
          name: 'Team A',
          players: [
            {
              id: 1,
              name: 'Player 1',
              jerseyNumber: 10,
              position: PlayerPosition.FORWARD,
            },
            {
              id: 2,
              name: 'Player 2',
              jerseyNumber: 9,
              position: PlayerPosition.FORWARD,
            },
          ],
        },
        awayTeam: {
          id: 2,
          name: 'Team B',
        },
        score: { home: 2, away: 0 },
        currentMinute: 90,
        events,
        startTime: new Date(),
      };

      playerStatisticsService.create
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce({
          id: 2,
          playerId: 2,
          season: '2024-2025',
          goals: 1,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          minutesPlayed: 90,
          savesMade: 0,
          fouls: 0,
          goalsConceded: 0,
          shotsOffTarget: 0,
          shotsOnTarget: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      await service.processMatchEvents(matchState, '2024-2025');

      expect(playerStatisticsService.create).toHaveBeenCalledTimes(2);
    });

    it('should track assists from goal metadata', async () => {
      const events: MatchEvent[] = [
        {
          id: '1',
          matchId: 1,
          type: MatchEventType.GOAL,
          minute: 10,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: {
            id: 1,
            name: 'Player 1',
            jerseyNumber: 10,
            position: PlayerPosition.FORWARD,
          },
          relatedPlayer: {
            id: 2,
            name: 'Player 2',
            jerseyNumber: 9,
            position: PlayerPosition.FORWARD,
          },
        },
        {
          id: '2',
          matchId: 1,
          type: MatchEventType.GOAL,
          minute: 30,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: {
            id: 3,
            name: 'Player 3',
            jerseyNumber: 7,
            position: PlayerPosition.FORWARD,
          },
          relatedPlayer: {
            id: 2,
            name: 'Player 2',
            jerseyNumber: 9,
            position: PlayerPosition.FORWARD,
          },
        },
      ];

      const matchState: MatchSimulationState = {
        matchId: 1,
        homeTeam: {
          id: 1,
          name: 'Team A',
          players: [
            {
              id: 1,
              name: 'Player 1',
              jerseyNumber: 10,
              position: PlayerPosition.FORWARD,
            },
            {
              id: 2,
              name: 'Player 2',
              jerseyNumber: 9,
              position: PlayerPosition.MIDFIELDER,
            },
            {
              id: 3,
              name: 'Player 3',
              jerseyNumber: 7,
              position: PlayerPosition.FORWARD,
            },
          ],
        },
        awayTeam: {
          id: 2,
          name: 'Team B',
        },
        score: { home: 2, away: 0 },
        currentMinute: 90,
        events,
        startTime: new Date(),
      };

      await service.processMatchEvents(matchState, '2024-2025');

      // Player 1: 1 goal, 0 assists
      expect(playerStatisticsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          goals: 1,
          assists: 0,
        }),
      );

      // Player 2: 0 goals, 2 assists
      expect(playerStatisticsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 2,
          goals: 0,
          assists: 2,
        }),
      );

      // Player 3: 1 goal, 0 assists
      expect(playerStatisticsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 3,
          goals: 1,
          assists: 0,
        }),
      );
    });

    it('should track goalkeeper statistics', async () => {
      const events: MatchEvent[] = [
        {
          id: '1',
          matchId: 1,
          type: MatchEventType.SHOT_ON_TARGET,
          minute: 10,
          timestamp: new Date(),
          teamId: 2,
          teamName: 'Team B',
        },
        {
          id: '2',
          matchId: 1,
          type: MatchEventType.SHOT_ON_TARGET,
          minute: 20,
          timestamp: new Date(),
          teamId: 2,
          teamName: 'Team B',
        },
      ];

      const matchState: MatchSimulationState = {
        matchId: 1,
        homeTeam: {
          id: 1,
          name: 'Team A',
          players: [
            {
              id: 1,
              name: 'Goalkeeper 1',
              jerseyNumber: 1,
              position: PlayerPosition.GOALKEEPER,
            },
          ],
        },
        awayTeam: {
          id: 2,
          name: 'Team B',
        },
        score: { home: 0, away: 2 },
        currentMinute: 90,
        events,
        startTime: new Date(),
      };

      await service.processMatchEvents(matchState, '2024-2025');

      // Goalkeeper should have savesMade and goalsConceded
      expect(playerStatisticsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 1,
          savesMade: 2, // 2 shots on target counted as saves
          goalsConceded: 2, // Passed as parameter
        }),
      );
    });
  });
});

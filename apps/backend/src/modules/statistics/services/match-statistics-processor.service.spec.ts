import { Test, TestingModule } from '@nestjs/testing';
import { MatchStatisticsProcessorService } from './match-statistics-processor.service';
import { PlayerStatisticsService } from './player-statistics.service';
import { MatchEvent, MatchEventType } from '@repo/core';

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
      await service.processMatchEvents([], '2024-2025', []);
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
          player: { id: 1, name: 'Player 1', jerseyNumber: 10 },
        },
        {
          id: '2',
          matchId: 1,
          type: MatchEventType.CARD_YELLOW,
          minute: 20,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: { id: 1, name: 'Player 1', jerseyNumber: 10 },
        },
      ];

      const allPlayers = [{ id: 1, name: 'Player 1' }];

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

      await service.processMatchEvents(events, '2024-2025', allPlayers);

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
        shotsOnTarget: 0,
        rating: undefined,
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
          player: { id: 1, name: 'Player 1', jerseyNumber: 10 },
        },
        {
          id: '2',
          matchId: 1,
          type: MatchEventType.GOAL,
          minute: 30,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: { id: 1, name: 'Player 1', jerseyNumber: 10 },
        },
      ];

      const allPlayers = [
        { id: 1, name: 'Player 1' },
        { id: 2, name: 'Player 2' }, // Player without events
      ];

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

      await service.processMatchEvents(events, '2024-2025', allPlayers);

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
          player: { id: 1, name: 'Player 1', jerseyNumber: 10 },
        },
        {
          id: '2',
          matchId: 1,
          type: MatchEventType.GOAL,
          minute: 20,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: { id: 2, name: 'Player 2', jerseyNumber: 9 },
        },
      ];

      const allPlayers = [
        { id: 1, name: 'Player 1' },
        { id: 2, name: 'Player 2' },
      ];

      await service.processMatchEvents(events, '2024-2025', allPlayers);

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

      const allPlayers = [{ id: 1, name: 'Player 1' }];

      await service.processMatchEvents(events, '2024-2025', allPlayers);

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
          player: { id: 1, name: 'Player 1', jerseyNumber: 10 },
        },
      ];

      const allPlayers = [{ id: 1, name: 'Player 1' }];

      await service.processMatchEvents(events, '2024-2025', allPlayers);

      expect(playerStatisticsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          redCards: 1,
          yellowCards: 0,
          goals: 0,
        }),
      );
    });

    it('should continue processing other players if one fails', async () => {
      const events: MatchEvent[] = [
        {
          id: '1',
          matchId: 1,
          type: MatchEventType.GOAL,
          minute: 10,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: { id: 1, name: 'Player 1', jerseyNumber: 10 },
        },
        {
          id: '2',
          matchId: 1,
          type: MatchEventType.GOAL,
          minute: 20,
          timestamp: new Date(),
          teamId: 1,
          teamName: 'Team A',
          player: { id: 2, name: 'Player 2', jerseyNumber: 9 },
        },
      ];

      const allPlayers = [
        { id: 1, name: 'Player 1' },
        { id: 2, name: 'Player 2' },
      ];

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

      await service.processMatchEvents(events, '2024-2025', allPlayers);

      expect(playerStatisticsService.create).toHaveBeenCalledTimes(2);
    });
  });
});

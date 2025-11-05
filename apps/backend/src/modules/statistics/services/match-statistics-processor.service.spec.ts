import { Test, TestingModule } from '@nestjs/testing';
import { MatchStatisticsProcessorService } from './match-statistics-processor.service';
import { PlayerStatisticsService } from './player-statistics.service';
import { MatchEvent, MatchEventType } from '@repo/core';

describe('MatchStatisticsProcessorService', () => {
  let service: MatchStatisticsProcessorService;
  let playerStatisticsService: jest.Mocked<PlayerStatisticsService>;

  const mockPlayerStatisticsService = {
    findByPlayerAndSeason: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
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
      await service.processMatchEvents([], '2024-2025');
      expect(
        playerStatisticsService.findByPlayerAndSeason,
      ).not.toHaveBeenCalled();
    });

    it('should create new statistics for player without existing stats', async () => {
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

      playerStatisticsService.findByPlayerAndSeason.mockResolvedValue(null);

      playerStatisticsService.create.mockResolvedValue({
        id: 1,
        playerId: 1,
        season: '2024-2025',
        matchesPlayed: 1,
        goals: 1,
        assists: 0,
        yellowCards: 1,
        redCards: 0,
        minutesPlayed: 0,
        cleanSheets: 0,
        savesMade: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.processMatchEvents(events, '2024-2025');

      expect(
        playerStatisticsService.findByPlayerAndSeason,
      ).toHaveBeenCalledWith(1, '2024-2025');

      expect(playerStatisticsService.create).toHaveBeenCalledWith({
        playerId: 1,
        season: '2024-2025',
        matchesPlayed: 1,
        goals: 1,
        assists: 0,
        yellowCards: 1,
        redCards: 0,
        minutesPlayed: 0,
        cleanSheets: 0,
        savesMade: 0,
      });
    });

    it('should update existing statistics for player', async () => {
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

      const existingStats = {
        id: 1,
        playerId: 1,
        season: '2024-2025',
        matchesPlayed: 5,
        goals: 3,
        assists: 2,
        yellowCards: 1,
        redCards: 0,
        minutesPlayed: 450,
        cleanSheets: 0,
        savesMade: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      playerStatisticsService.findByPlayerAndSeason.mockResolvedValue(
        existingStats,
      );

      playerStatisticsService.update.mockResolvedValue({
        ...existingStats,
        matchesPlayed: 6,
        goals: 5,
      });

      await service.processMatchEvents(events, '2024-2025');

      expect(playerStatisticsService.update).toHaveBeenCalledWith(1, {
        matchesPlayed: 6,
        goals: 5,
        assists: 2,
        yellowCards: 1,
        redCards: 0,
      });
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

      playerStatisticsService.findByPlayerAndSeason.mockResolvedValue(null);

      await service.processMatchEvents(events, '2024-2025');

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

      await service.processMatchEvents(events, '2024-2025');

      expect(
        playerStatisticsService.findByPlayerAndSeason,
      ).not.toHaveBeenCalled();
      expect(playerStatisticsService.create).not.toHaveBeenCalled();
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

      playerStatisticsService.findByPlayerAndSeason.mockResolvedValue(null);

      await service.processMatchEvents(events, '2024-2025');

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

      playerStatisticsService.findByPlayerAndSeason.mockResolvedValue(null);

      playerStatisticsService.create
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce({
          id: 2,
          playerId: 2,
          season: '2024-2025',
          matchesPlayed: 1,
          goals: 1,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          minutesPlayed: 0,
          cleanSheets: 0,
          savesMade: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      await service.processMatchEvents(events, '2024-2025');

      expect(playerStatisticsService.create).toHaveBeenCalledTimes(2);
    });
  });
});

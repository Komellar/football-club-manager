import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityNotFoundError } from 'typeorm';
// Removed unused exception imports - services now use global exception filter

import { PlayerStatisticsService } from '../services/player-statistics.service';
import { PlayerStatistics } from '@/shared/entities/player-statistics.entity';
import { PaginationHelper } from '@/shared/helpers/pagination.helper';
import {
  CreatePlayerStatisticsDto,
  UpdatePlayerStatisticsDto,
  PlayerStatisticsQueryDto,
} from '@repo/core';

// Mock data
const mockStatistics = {
  id: 1,
  playerId: 1,
  season: '2023-24',
  matchesPlayed: 30,
  minutesPlayed: 2700,
  goals: 15,
  assists: 8,
  yellowCards: 3,
  redCards: 0,
  cleanSheets: 0,
  savesMade: 0,
  rating: 8.5,
  averageRating: 8.2,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCreateDto: CreatePlayerStatisticsDto = {
  playerId: 1,
  season: '2023-24',
  matchesPlayed: 30,
  minutesPlayed: 2700,
  goals: 15,
  assists: 8,
  yellowCards: 3,
  redCards: 0,
  cleanSheets: 0,
  savesMade: 0,
  rating: 8.5,
};

const mockUpdateDto: UpdatePlayerStatisticsDto = {
  goals: 16,
  assists: 9,
  rating: 8.7,
};

const mockQueryDto: PlayerStatisticsQueryDto = {
  page: 1,
  limit: 10,
  where: {
    playerId: 1,
    season: '2023-24',
  },
};

// Mock QueryBuilder
const mockQueryBuilder = {
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
};

// Mock Repository
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  findAndCount: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  exists: jest.fn(),
};

// Mock PaginationHelper
jest.mock('../../../shared/helpers/pagination.helper', () => ({
  PaginationHelper: {
    paginate: jest.fn(),
  },
}));

describe('PlayerStatisticsService', () => {
  let service: PlayerStatisticsService;
  let repository: Repository<PlayerStatistics>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerStatisticsService,
        {
          provide: getRepositoryToken(PlayerStatistics),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PlayerStatisticsService>(PlayerStatisticsService);
    repository = module.get<Repository<PlayerStatistics>>(
      getRepositoryToken(PlayerStatistics),
    );

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create player statistics successfully', async () => {
      // Arrange
      mockRepository.create.mockReturnValue(mockStatistics);
      mockRepository.save.mockResolvedValue(mockStatistics);

      // Act
      const result = await service.create(mockCreateDto);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(mockCreateDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockStatistics);
      expect(result).toEqual(mockStatistics);
    });

    it('should throw Error on database error', async () => {
      // Arrange
      mockRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Act & Assert
      await expect(service.create(mockCreateDto)).rejects.toThrow(Error);
    });
  });

  describe('findAll', () => {
    const mockPaginationResult = {
      data: [mockStatistics],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };

    beforeEach(() => {
      (PaginationHelper.paginate as jest.Mock).mockResolvedValue(
        mockPaginationResult,
      );
    });

    it('should return paginated statistics', async () => {
      // Arrange
      mockRepository.findAndCount.mockResolvedValue([[mockStatistics], 1]);

      // Act
      const result = await service.findAll(mockQueryDto);

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          playerId: 1,
          season: '2023-24',
        },
        skip: 0,
        take: 10,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(mockStatistics);
    });

    it('should apply filters correctly', async () => {
      // Arrange
      mockRepository.findAndCount.mockResolvedValue([[mockStatistics], 1]);

      // Act
      await service.findAll(mockQueryDto);

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          playerId: 1,
          season: '2023-24',
        },
        skip: 0,
        take: 10,
      });
    });

    it('should throw Error on database error', async () => {
      // Arrange
      mockRepository.findAndCount.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findAll(mockQueryDto)).rejects.toThrow(Error);
    });
  });

  describe('findOne', () => {
    it('should return statistics by id', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockResolvedValue(mockStatistics);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(mockRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockStatistics);
    });

    it('should throw EntityNotFoundError if statistics not found', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError('PlayerStatistics', 'id'),
      );

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow(EntityNotFoundError);
    });

    it('should throw Error on database error', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow(Error);
    });
  });

  describe('update', () => {
    it('should update statistics successfully', async () => {
      // Arrange
      const updatedStats = { ...mockStatistics, ...mockUpdateDto };

      // First call for the existence check, second call for returning updated data
      mockRepository.findOneOrFail
        .mockResolvedValueOnce(mockStatistics) // First call: existence check
        .mockResolvedValueOnce(updatedStats); // Second call: return updated data
      mockRepository.update.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.update(1, mockUpdateDto);

      // Assert
      expect(mockRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRepository.update).toHaveBeenCalledWith(1, mockUpdateDto);
      expect(result).toEqual(updatedStats);
    });

    it('should throw EntityNotFoundError if statistics not found', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError('PlayerStatistics', 'id'),
      );

      // Act & Assert
      await expect(service.update(1, mockUpdateDto)).rejects.toThrow(
        EntityNotFoundError,
      );
    });

    it('should throw Error on database error', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockResolvedValue(mockStatistics);
      mockRepository.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.update(1, mockUpdateDto)).rejects.toThrow(Error);
    });
  });

  describe('remove', () => {
    it('should remove statistics successfully', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockResolvedValue(mockStatistics);
      mockRepository.remove.mockResolvedValue(mockStatistics);

      // Act
      await service.remove(1);

      // Assert
      expect(mockRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['player'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockStatistics);
    });

    it('should throw EntityNotFoundError if statistics not found', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError('PlayerStatistics', 'id'),
      );

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow(EntityNotFoundError);
    });

    it('should throw Error on database error', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow(Error);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { PlayerStatisticsService } from './player-statistics.service';
import { PlayerStatistics } from '@/shared/entities/player-statistics.entity';
import { PaginationHelper } from '../../shared/helpers/pagination.helper';
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
  playerId: 1,
  season: '2023-24',
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
  exists: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

// Mock PaginationHelper
jest.mock('../../shared/helpers/pagination.helper', () => ({
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

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Act & Assert
      await expect(service.create(mockCreateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
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
      // Act
      const result = await service.findAll(mockQueryDto);

      // Assert
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('stats');
      expect(PaginationHelper.paginate).toHaveBeenCalledWith(mockQueryBuilder, {
        page: mockQueryDto.page,
        limit: mockQueryDto.limit,
      });
      expect(result).toEqual(mockPaginationResult);
    });

    it('should apply filters correctly', async () => {
      // Act
      await service.findAll(mockQueryDto);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'stats.playerId = :playerId',
        {
          playerId: mockQueryDto.playerId,
        },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'stats.season = :season',
        {
          season: mockQueryDto.season,
        },
      );
    });

    it('should throw InternalServerErrorException on error', async () => {
      // Arrange
      (PaginationHelper.paginate as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findAll(mockQueryDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return statistics by id', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockStatistics);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockStatistics);
    });

    it('should throw NotFoundException if statistics not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow(
        new NotFoundException('Player statistics with ID 1 not found'),
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update statistics successfully', async () => {
      // Arrange
      const updatedStats = { ...mockStatistics, ...mockUpdateDto };

      mockRepository.exists.mockResolvedValue(true);
      mockRepository.findOneOrFail.mockResolvedValue(updatedStats);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.update(1, mockUpdateDto);

      // Assert
      expect(mockRepository.exists).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.update).toHaveBeenCalledWith(1, mockUpdateDto);
      expect(result).toEqual(updatedStats);
    });

    it('should throw NotFoundException if statistics not found', async () => {
      // Arrange
      mockRepository.exists.mockResolvedValue(false);

      // Act & Assert
      await expect(service.update(1, mockUpdateDto)).rejects.toThrow(
        new NotFoundException('Player statistics with ID 1 not found'),
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockRepository.exists.mockResolvedValue(true);
      mockRepository.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.update(1, mockUpdateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should remove statistics successfully', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockStatistics);
      mockRepository.remove.mockResolvedValue(mockStatistics);

      // Act
      await service.remove(1);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['player'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockStatistics);
    });

    it('should throw NotFoundException if statistics not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow(
        new NotFoundException('Player statistics with ID 1 not found'),
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});

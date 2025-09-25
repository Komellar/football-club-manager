import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

import { PlayersService } from './players.service';
import { Player } from '@/shared/entities/player.entity';
import { PaginationHelper } from '../../shared/helpers/pagination.helper';
import {
  PlayerPosition,
  CreatePlayerDto,
  UpdatePlayerDto,
  PlayerQueryDto,
} from '@repo/core';

// Mock data
const mockPlayer = {
  id: 1,
  name: 'John Doe',
  position: PlayerPosition.FORWARD,
  dateOfBirth: new Date('1995-01-01'),
  nationality: 'ESP',
  height: 180,
  weight: 75,
  jerseyNumber: 10,
  marketValue: 50000000,
  isActive: true,
  imageUrl: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
  transfers: [],
  contracts: [],
  get age() {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  },
} as Player;

const mockCreatePlayerDto: CreatePlayerDto = {
  name: 'John Doe',
  position: PlayerPosition.FORWARD,
  dateOfBirth: new Date('1995-01-01'),
  nationality: 'ESP',
  height: 180,
  weight: 75,
  jerseyNumber: 10,
  marketValue: 50000000,
  isActive: true,
};

const mockUpdatePlayerDto: UpdatePlayerDto = {
  name: 'John Updated',
  height: 185,
  weight: 80,
};

const mockQueryDto: PlayerQueryDto = {
  page: 1,
  limit: 10,
  sortBy: 'name',
  sortOrder: 'asc',
  position: PlayerPosition.FORWARD,
  isActive: true,
  nationality: 'ESP',
  search: 'John',
};

// Mock QueryBuilder
const mockQueryBuilder = {
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
};

// Mock Repository
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
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

// Mock fs promises
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

describe('PlayersService', () => {
  let service: PlayersService;
  let repository: Repository<Player>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayersService,
        {
          provide: getRepositoryToken(Player),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PlayersService>(PlayersService);
    repository = module.get<Repository<Player>>(getRepositoryToken(Player));

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new player successfully', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null); // No existing player with jersey number
      mockRepository.create.mockReturnValue(mockPlayer);
      mockRepository.save.mockResolvedValue(mockPlayer);

      // Act
      const result = await service.create(mockCreatePlayerDto);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          jerseyNumber: mockCreatePlayerDto.jerseyNumber,
          isActive: true,
        },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(mockCreatePlayerDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockPlayer);
      expect(result).toEqual(mockPlayer);
    });

    it('should throw BadRequestException if jersey number is taken', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockPlayer);

      // Act & Assert
      await expect(service.create(mockCreatePlayerDto)).rejects.toThrow(
        new BadRequestException(
          `Jersey number ${mockCreatePlayerDto.jerseyNumber} is already taken by an active player`,
        ),
      );
    });

    it('should create player without jersey number validation if not provided', async () => {
      // Arrange
      const createDto = { ...mockCreatePlayerDto, jerseyNumber: undefined };
      mockRepository.create.mockReturnValue(mockPlayer);
      mockRepository.save.mockResolvedValue(mockPlayer);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(mockRepository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockPlayer);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(mockCreatePlayerDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    const mockPaginationResult = {
      data: [mockPlayer],
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

    it('should return paginated players', async () => {
      // Act
      const result = await service.findAll(mockQueryDto);

      // Assert
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('player');
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
        'player.position = :position',
        {
          position: mockQueryDto.position,
        },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'player.isActive = :isActive',
        {
          isActive: mockQueryDto.isActive,
        },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'player.nationality = :nationality',
        {
          nationality: mockQueryDto.nationality,
        },
      );
    });

    it('should handle search filter', async () => {
      // Act
      await service.findAll(mockQueryDto);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(player.name ILIKE :search OR CAST(player.jerseyNumber AS TEXT) = :jerseySearch)',
        {
          search: `%${mockQueryDto.search}%`,
          jerseySearch: mockQueryDto.search,
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
    it('should return a player by id', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockPlayer);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockPlayer);
    });

    it('should throw NotFoundException if player not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow(
        new NotFoundException('Player with ID 1 not found'),
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
    it('should update a player successfully', async () => {
      // Arrange
      const existingPlayer = { ...mockPlayer };
      const updatedPlayer = { ...mockPlayer, ...mockUpdatePlayerDto };

      mockRepository.findOne
        .mockResolvedValueOnce(existingPlayer) // First call to check existence
        .mockResolvedValueOnce(updatedPlayer); // Second call to get updated player
      mockRepository.update.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.update(1, mockUpdatePlayerDto);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.update).toHaveBeenCalledWith(
        1,
        mockUpdatePlayerDto,
      );
      expect(result).toEqual(updatedPlayer);
    });

    it('should throw NotFoundException if player not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(1, mockUpdatePlayerDto)).rejects.toThrow(
        new NotFoundException('Player with ID 1 not found'),
      );
    });

    it('should check jersey number conflicts when updating jersey number', async () => {
      // Arrange
      const updateWithJerseyDto = { ...mockUpdatePlayerDto, jerseyNumber: 11 };
      const existingPlayer = { ...mockPlayer, jerseyNumber: 10 };

      mockRepository.findOne
        .mockResolvedValueOnce(existingPlayer) // Existing player check
        .mockResolvedValueOnce(null) // No conflicting player
        .mockResolvedValueOnce({ ...existingPlayer, ...updateWithJerseyDto }); // Updated player
      mockRepository.update.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.update(1, updateWithJerseyDto);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          jerseyNumber: updateWithJerseyDto.jerseyNumber,
          isActive: true,
          id: Not(1),
        },
      });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if jersey number is taken by another player', async () => {
      // Arrange
      const updateWithJerseyDto = { ...mockUpdatePlayerDto, jerseyNumber: 11 };
      const existingPlayer = { ...mockPlayer, jerseyNumber: 10 };
      const conflictingPlayer = { ...mockPlayer, id: 2, jerseyNumber: 11 };

      mockRepository.findOne
        .mockResolvedValueOnce(existingPlayer) // Existing player check
        .mockResolvedValueOnce(conflictingPlayer); // Conflicting player found

      // Act & Assert
      await expect(service.update(1, updateWithJerseyDto)).rejects.toThrow(
        new BadRequestException(
          `Jersey number ${updateWithJerseyDto.jerseyNumber} is already taken by another active player`,
        ),
      );
    });
  });

  describe('remove', () => {
    it('should remove a player successfully', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockPlayer);
      mockRepository.remove.mockResolvedValue(mockPlayer);

      // Act
      await service.remove(1);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockPlayer);
    });

    it('should throw NotFoundException if player not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow(
        new NotFoundException('Player with ID 1 not found'),
      );
    });
  });

  describe('uploadImage', () => {
    const mockFile = {
      buffer: Buffer.from('test image data'),
      originalname: 'test.jpg',
    } as Express.Multer.File;

    beforeEach(() => {
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    });

    it('should upload image successfully', async () => {
      // Arrange
      const updatedPlayerWithImage = {
        ...mockPlayer,
        imageUrl: '/uploads/players/1_123456789.jpg',
      };

      mockRepository.findOne
        .mockResolvedValueOnce(mockPlayer) // Player exists check
        .mockResolvedValueOnce(updatedPlayerWithImage); // Updated player with image
      mockRepository.update.mockResolvedValue({ affected: 1 });

      jest.spyOn(Date, 'now').mockReturnValue(123456789);

      // Act
      const result = await service.uploadImage(1, mockFile);

      // Assert
      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join(process.cwd(), 'uploads', 'players'),
        { recursive: true },
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(process.cwd(), 'uploads', 'players', '1_123456789.jpg'),
        mockFile.buffer,
      );
      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        imageUrl: '/uploads/players/1_123456789.jpg',
      });
      expect(result).toEqual(updatedPlayerWithImage);
    });

    it('should throw NotFoundException if player not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.uploadImage(1, mockFile)).rejects.toThrow(
        new NotFoundException('Player with ID 1 not found'),
      );
    });

    it('should throw BadRequestException if file is invalid', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockPlayer);
      const invalidFile = { buffer: null, originalname: null } as any;

      // Act & Assert
      await expect(service.uploadImage(1, invalidFile)).rejects.toThrow(
        new BadRequestException('Invalid file provided'),
      );
    });

    it('should throw BadRequestException if file is empty', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockPlayer);
      const emptyFile = {
        buffer: Buffer.alloc(0),
        originalname: 'test.jpg',
      } as Express.Multer.File;

      // Act & Assert
      await expect(service.uploadImage(1, emptyFile)).rejects.toThrow(
        new BadRequestException('File is empty'),
      );
    });
  });
});

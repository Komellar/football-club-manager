import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityNotFoundError, Not } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

import * as fs from 'fs/promises';
import * as path from 'path';

import { PlayersService } from '../services/players.service';
import { Player } from '@/shared/entities/player.entity';

import {
  PlayerPosition,
  SortOrder,
  CreatePlayerDto,
  PlayerListDto,
} from '@repo/core';

// Mock data
const mockPlayer = {
  id: 1,
  name: 'John Doe',
  position: PlayerPosition.FORWARD,
  dateOfBirth: new Date('1995-01-01'),
  country: 'ESP',
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
  statistics: [],
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
  country: 'ESP',
  height: 180,
  weight: 75,
  jerseyNumber: 10,
  marketValue: 50000000,
  isActive: true,
};

const mockUpdatePlayerDto: CreatePlayerDto = {
  name: 'John Updated',
  position: PlayerPosition.FORWARD,
  dateOfBirth: new Date('1995-01-01'),
  country: 'ESP',
  height: 185,
  weight: 80,
  jerseyNumber: 11,
  marketValue: 55000000,
  isActive: true,
};

const mockQueryDto: PlayerListDto = {
  page: 1,
  limit: 10,
  sort: {
    by: 'name',
    order: SortOrder.ASC,
  },
  where: {
    position: PlayerPosition.FORWARD,
    isActive: true,
    country: 'ESP',
  },
  search: 'John',
};

// Mock Repository

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
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  }),
};

// Mock fs promises
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

describe('PlayersService', () => {
  let service: PlayersService;

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

    it('should throw Error on database error', async () => {
      // Arrange
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(mockCreatePlayerDto)).rejects.toThrow(Error);
    });
  });

  describe('findAll', () => {
    it('should return paginated players', async () => {
      // Arrange
      mockRepository.findAndCount.mockResolvedValue([[mockPlayer], 1]);

      // Act
      const result = await service.findAll(mockQueryDto);

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.arrayContaining([
            expect.objectContaining({
              position: expect.objectContaining({
                _type: 'equal',
                _value: PlayerPosition.FORWARD,
              }),
              isActive: expect.objectContaining({
                _type: 'equal',
                _value: true,
              }),
              country: expect.objectContaining({
                _type: 'equal',
                _value: 'ESP',
              }),
              name: expect.objectContaining({ _type: 'ilike' }),
            }),
          ]),
          order: { name: SortOrder.ASC },
          skip: 0,
          take: 10,
        }),
      );
      expect(result).toEqual({
        data: [mockPlayer],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    });

    it('should apply filters correctly', async () => {
      // Arrange
      mockRepository.findAndCount.mockResolvedValue([[mockPlayer], 1]);
      const queryWithFilters = {
        where: {
          position: PlayerPosition.MIDFIELDER,
          isActive: false,
          country: 'DEU' as const,
        },
        page: 2,
        limit: 5,
        order: { name: SortOrder.DESC },
      };

      // Act
      await service.findAll(queryWithFilters);

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            position: expect.objectContaining({
              _type: 'equal',
              _value: PlayerPosition.MIDFIELDER,
            }),
            isActive: expect.objectContaining({
              _type: 'equal',
              _value: false,
            }),
            country: expect.objectContaining({
              _type: 'equal',
              _value: 'DEU',
            }),
          }),
          order: undefined,
          skip: 5,
          take: 5,
        }),
      );
    });

    it('should handle default pagination when no query provided', async () => {
      // Arrange
      mockRepository.findAndCount.mockResolvedValue([[mockPlayer], 1]);

      // Act
      await service.findAll();

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('should throw Error on error', async () => {
      // Arrange
      mockRepository.findAndCount.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findAll(mockQueryDto)).rejects.toThrow(Error);
    });
  });

  describe('findOne', () => {
    it('should return a player by id', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockResolvedValue(mockPlayer);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(mockRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockPlayer);
    });

    it('should throw EntityNotFoundError if player not found', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(Player, { id: 1 }),
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
    it('should update a player successfully', async () => {
      // Arrange
      const existingPlayer = { ...mockPlayer };
      const updatedPlayer = { ...mockPlayer, ...mockUpdatePlayerDto };

      mockRepository.findOneOrFail.mockResolvedValue(existingPlayer); // Check existence
      mockRepository.findOneOrFail.mockResolvedValue(updatedPlayer); // Get updated player after update
      mockRepository.update.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.update(1, mockUpdatePlayerDto);

      // Assert
      expect(mockRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        id: 1,
        ...mockUpdatePlayerDto,
      });
      expect(result).toEqual(updatedPlayer);
    });

    it('should throw EntityNotFoundError if player not found', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(Player, { id: 1 }),
      );

      // Act & Assert
      await expect(service.update(1, mockUpdatePlayerDto)).rejects.toThrow(
        EntityNotFoundError,
      );
    });

    it('should check jersey number conflicts when updating jersey number', async () => {
      // Arrange
      const updateWithJerseyDto = { ...mockUpdatePlayerDto, jerseyNumber: 11 };
      const existingPlayer = { ...mockPlayer, jerseyNumber: 10 };

      mockRepository.findOneOrFail.mockResolvedValue(existingPlayer); // Existing player check
      mockRepository.findOne
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

      mockRepository.findOneOrFail.mockResolvedValue(existingPlayer); // Existing player check
      mockRepository.findOne.mockResolvedValue(conflictingPlayer); // Conflicting player found

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
      mockRepository.findOneOrFail.mockResolvedValue(mockPlayer);
      mockRepository.remove.mockResolvedValue(mockPlayer);

      // Act
      await service.remove(1);

      // Assert
      expect(mockRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['contracts', 'transfers', 'statistics'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockPlayer);
    });

    it('should throw EntityNotFoundError if player not found', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(Player, { id: 1 }),
      );

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow(EntityNotFoundError);
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

      mockRepository.exists.mockResolvedValue(true); // Player exists check
      mockRepository.findOneOrFail.mockResolvedValue(updatedPlayerWithImage); // Updated player with image
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

    it('should throw EntityNotFoundError if player not found', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(Player, { id: 1 }),
      );

      // Act & Assert
      await expect(service.uploadImage(1, mockFile)).rejects.toThrow(
        EntityNotFoundError,
      );
    });

    it('should throw BadRequestException if file is invalid', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockResolvedValue(mockPlayer);
      const invalidFile = { buffer: null, originalname: null } as any;

      // Act & Assert
      await expect(service.uploadImage(1, invalidFile)).rejects.toThrow(
        new BadRequestException('Invalid file provided'),
      );
    });

    it('should throw BadRequestException if file is empty', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockResolvedValue(mockPlayer);
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

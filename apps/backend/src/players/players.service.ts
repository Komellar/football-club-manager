import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Player } from './entities/player.entity';
import type {
  CreatePlayerDto,
  UpdatePlayerDto,
  PlayerResponseDto,
  PlayerQueryDto,
} from '@repo/core';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {}

  async create(createPlayerDto: CreatePlayerDto): Promise<PlayerResponseDto> {
    try {
      if (createPlayerDto.jerseyNumber) {
        const existingPlayer = await this.playerRepository.findOne({
          where: {
            jerseyNumber: createPlayerDto.jerseyNumber,
            isActive: true,
          },
        });

        if (existingPlayer) {
          throw new BadRequestException(
            `Jersey number ${createPlayerDto.jerseyNumber} is already taken by an active player`,
          );
        }
      }

      const player = this.playerRepository.create(createPlayerDto);
      const savedPlayer = await this.playerRepository.save(player);

      return this.mapToResponseDto(savedPlayer);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create player. Please try again.',
      );
    }
  }

  async findAll(
    queryDto?: Partial<PlayerQueryDto>,
  ): Promise<PlayerResponseDto[]> {
    try {
      const queryBuilder = this.playerRepository.createQueryBuilder('player');

      // Apply filters
      if (queryDto?.position) {
        queryBuilder.andWhere('player.position = :position', {
          position: queryDto.position,
        });
      }

      if (queryDto?.isActive !== undefined) {
        queryBuilder.andWhere('player.isActive = :isActive', {
          isActive: queryDto.isActive,
        });
      }

      if (queryDto?.nationality) {
        queryBuilder.andWhere('player.nationality = :nationality', {
          nationality: queryDto.nationality,
        });
      }

      if (queryDto?.search) {
        queryBuilder.andWhere('player.name ILIKE :search', {
          search: `%${queryDto.search}%`,
        });
      }

      // Age filtering - using precise date-based calculation
      if (queryDto?.minAge || queryDto?.maxAge) {
        if (queryDto.maxAge) {
          queryBuilder.andWhere(
            "DATE_TRUNC('day', player.dateOfBirth) >= DATE_TRUNC('day', CURRENT_DATE - INTERVAL ':maxAge years')",
            { maxAge: queryDto.maxAge },
          );
        }
        if (queryDto.minAge) {
          queryBuilder.andWhere(
            "DATE_TRUNC('day', player.dateOfBirth) <= DATE_TRUNC('day', CURRENT_DATE - INTERVAL ':minAge years')",
            { minAge: queryDto.minAge },
          );
        }
      }

      // Sorting
      const sortBy = queryDto?.sortBy || 'name';
      const sortOrder = queryDto?.sortOrder || 'asc';
      const orderDirection =
        sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(`player.${sortBy}`, orderDirection);

      // Pagination
      if (queryDto?.page && queryDto?.limit) {
        const skip = (queryDto.page - 1) * queryDto.limit;
        queryBuilder.skip(skip).take(queryDto.limit);
      }

      const players = await queryBuilder.getMany();
      return players.map((player) => this.mapToResponseDto(player));
    } catch {
      throw new InternalServerErrorException(
        'Failed to retrieve players. Please try again.',
      );
    }
  }

  async findOne(id: number): Promise<PlayerResponseDto> {
    try {
      const player = await this.playerRepository.findOne({
        where: { id },
      });

      if (!player) {
        throw new NotFoundException(`Player with ID ${id} not found`);
      }

      return this.mapToResponseDto(player);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve player. Please try again.',
      );
    }
  }

  async update(
    id: number,
    updatePlayerDto: UpdatePlayerDto,
  ): Promise<PlayerResponseDto> {
    try {
      const existingPlayer = await this.playerRepository.findOne({
        where: { id },
      });

      if (!existingPlayer) {
        throw new NotFoundException(`Player with ID ${id} not found`);
      }

      // Check jersey number conflicts if updating jersey number
      if (
        updatePlayerDto.jerseyNumber &&
        updatePlayerDto.jerseyNumber !== existingPlayer.jerseyNumber
      ) {
        const conflictingPlayer = await this.playerRepository.findOne({
          where: {
            jerseyNumber: updatePlayerDto.jerseyNumber,
            isActive: true,
            id: Not(id),
          },
        });

        if (conflictingPlayer) {
          throw new BadRequestException(
            `Jersey number ${updatePlayerDto.jerseyNumber} is already taken by another active player`,
          );
        }
      }

      await this.playerRepository.update(id, updatePlayerDto);
      const updatedPlayer = await this.playerRepository.findOne({
        where: { id },
      });

      return this.mapToResponseDto(updatedPlayer!);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update player. Please try again.',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const player = await this.playerRepository.findOne({
        where: { id },
      });

      if (!player) {
        throw new NotFoundException(`Player with ID ${id} not found`);
      }

      await this.playerRepository.remove(player);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete player. Please try again.',
      );
    }
  }

  private mapToResponseDto(player: Player): PlayerResponseDto {
    return {
      id: player.id,
      name: player.name,
      position: player.position,
      dateOfBirth: player.dateOfBirth,
      nationality: player.nationality,
      height: player.height,
      weight: player.weight,
      jerseyNumber: player.jerseyNumber,
      marketValue: player.marketValue,
      isActive: player.isActive,
      age: player.age,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    };
  }
}

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, SelectQueryBuilder } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PaginationHelper } from '../../shared/helpers/pagination.helper';
import { Player } from '@/shared/entities/player.entity';
import type {
  CreatePlayerDto,
  UpdatePlayerDto,
  PlayerResponseDto,
  PlayerQueryDto,
  PaginatedPlayerResponseDto,
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

      return savedPlayer;
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
  ): Promise<PaginatedPlayerResponseDto> {
    try {
      const queryBuilder = this.playerRepository.createQueryBuilder('player');
      this.applyFilters(queryBuilder, queryDto);
      this.applySorting(queryBuilder, queryDto);

      const paginationOptions = {
        page: queryDto?.page,
        limit: queryDto?.limit,
      };

      const result = await PaginationHelper.paginate(
        queryBuilder,
        paginationOptions,
      );

      return {
        data: result.data,
        pagination: result.pagination,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to retrieve players. Please try again.',
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

      if (!updatedPlayer) {
        throw new InternalServerErrorException(
          'Failed to retrieve updated player.',
        );
      }

      return updatedPlayer;
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
        relations: ['contracts', 'transfers', 'statistics'],
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
        `Failed to delete player with id ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async uploadImage(
    id: number,
    file: Express.Multer.File,
  ): Promise<PlayerResponseDto> {
    try {
      const playerExists = await this.playerRepository.exists({
        where: { id },
      });

      if (!playerExists) {
        throw new NotFoundException(`Player with ID ${id} not found`);
      }

      if (!file?.buffer || !file?.originalname) {
        throw new BadRequestException('Invalid file provided');
      }

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads', 'players');
      await fs.mkdir(uploadDir, { recursive: true });

      const originalName = file.originalname || 'upload';
      const fileExtension = path.extname(originalName) || '.jpg';
      const filename = `${id}_${Date.now()}${fileExtension}`;
      const filePath = path.join(uploadDir, filename);

      if (file.buffer.length === 0) {
        throw new BadRequestException('File is empty');
      }

      await fs.writeFile(filePath, file.buffer);

      const imageUrl = `/uploads/players/${filename}`;

      await this.playerRepository.update(id, { imageUrl });
      const updatedPlayer = await this.playerRepository.findOne({
        where: { id },
      });

      if (!updatedPlayer) {
        throw new InternalServerErrorException(
          'Failed to retrieve updated player.',
        );
      }

      return updatedPlayer;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to upload player image. Please try again.',
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

      return player;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve player. Please try again.',
      );
    }
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Player>,
    queryDto?: Partial<PlayerQueryDto>,
  ): void {
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
      queryBuilder.andWhere(
        '(player.name ILIKE :search OR CAST(player.jerseyNumber AS TEXT) = :jerseySearch)',
        {
          search: `%${queryDto.search}%`,
          jerseySearch: queryDto.search,
        },
      );
    }

    if (queryDto?.maxAge) {
      queryBuilder.andWhere(
        "DATE_TRUNC('day', player.dateOfBirth) >= DATE_TRUNC('day', CURRENT_DATE - INTERVAL ':maxAge years')",
        { maxAge: queryDto.maxAge },
      );
    }

    if (queryDto?.minAge) {
      queryBuilder.andWhere(
        "DATE_TRUNC('day', player.dateOfBirth) <= DATE_TRUNC('day', CURRENT_DATE - INTERVAL ':minAge years')",
        { minAge: queryDto.minAge },
      );
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Player>,
    queryDto?: Partial<PlayerQueryDto>,
  ): void {
    const sortBy = queryDto?.sortBy || 'name';
    const sortOrder = queryDto?.sortOrder || 'asc';
    const orderDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`player.${sortBy}`, orderDirection);
  }
}

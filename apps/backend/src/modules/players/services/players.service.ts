import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Player } from '@/shared/entities/player.entity';
import { ListQueryBuilder } from '@/shared/query/list-query-builder';
import { FilterOptions, FilterMode } from '@repo/core';
import type {
  CreatePlayerDto,
  PlayerResponseDto,
  PlayerListDto,
  PaginatedPlayerListResponseDto,
} from '@repo/core';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {}

  async create(createPlayerDto: CreatePlayerDto): Promise<PlayerResponseDto> {
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
  }

  async findAll(
    queryDto?: Partial<PlayerListDto>,
  ): Promise<PaginatedPlayerListResponseDto> {
    const filterOptions: FilterOptions = {
      defaultFilterMode: FilterMode.EXACT,
      searchOptions: {
        searchFields: ['name'],
        searchMode: FilterMode.PARTIAL,
      },
      filterModes: {
        dateOfBirth: FilterMode.BETWEEN,
      },
    };

    return await ListQueryBuilder.executeQuery(
      this.playerRepository,
      queryDto,
      filterOptions,
    );
  }

  async update(
    id: number,
    updatePlayerDto: CreatePlayerDto,
  ): Promise<PlayerResponseDto> {
    const existingPlayer = await this.playerRepository.findOneOrFail({
      where: { id },
    });

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
    return await this.playerRepository.findOneOrFail({
      where: { id },
    });
  }

  async remove(id: number): Promise<void> {
    const player = await this.playerRepository.findOneOrFail({
      where: { id },
      relations: ['contracts', 'transfers', 'statistics'],
    });

    await this.playerRepository.remove(player);
  }

  async uploadImage(
    id: number,
    file: Express.Multer.File,
  ): Promise<PlayerResponseDto> {
    // This will throw EntityNotFoundError if player doesn't exist
    await this.playerRepository.findOneOrFail({ where: { id } });

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
    return await this.playerRepository.findOneOrFail({
      where: { id },
    });
  }

  async findOne(id: number): Promise<PlayerResponseDto> {
    return await this.playerRepository.findOneOrFail({
      where: { id },
    });
  }
}

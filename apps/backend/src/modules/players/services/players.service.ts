import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Player } from '@/shared/entities/player.entity';
import { ListQueryBuilder } from '@/shared/query/list-query-builder';
import { FilterOptions, FilterMode, PlayerPosition } from '@repo/core';
import type {
  CreatePlayerDto,
  PlayerResponseDto,
  PlayerListDto,
  PaginatedPlayerListResponseDto,
} from '@repo/core';

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);

/** Returns the extension matching the image's magic bytes, or null. */
export function detectImageExtension(buffer: Buffer): '.png' | '.jpg' | null {
  if (buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    return '.png';
  }
  if (buffer.subarray(0, JPEG_SIGNATURE.length).equals(JPEG_SIGNATURE)) {
    return '.jpg';
  }
  return null;
}

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {}

  async create(createPlayerDto: CreatePlayerDto): Promise<PlayerResponseDto> {
    if (createPlayerDto.jerseyNumber && createPlayerDto.isActive) {
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
    const playerExists = await this.playerRepository.exists({
      where: { id },
    });

    if (!playerExists) {
      throw new BadRequestException(`Player with ID ${id} does not exist`);
    }

    // Check jersey number conflicts
    if (updatePlayerDto.jerseyNumber && updatePlayerDto.isActive) {
      const conflictingPlayer = await this.playerRepository.exists({
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
    } else if (!updatePlayerDto.isActive) {
      // If deactivating player, clear jersey number
      updatePlayerDto.jerseyNumber = null;
    }

    await this.playerRepository.save({
      ...updatePlayerDto,
      id,
    });
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

    if (!file?.buffer) {
      throw new BadRequestException('Invalid file provided');
    }

    if (file.buffer.length === 0) {
      throw new BadRequestException('File is empty');
    }

    // The extension comes from the file's own signature, never from the
    // client-supplied name: a PNG header followed by HTML and named
    // "x.html" would otherwise be stored and served as a web page.
    const fileExtension = detectImageExtension(file.buffer);
    if (!fileExtension) {
      throw new BadRequestException('Only JPEG and PNG images are allowed');
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', 'players');
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${id}_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, filename);

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

  async getRandomMatchSquad(): Promise<PlayerResponseDto[]> {
    const [goalkeepers, defenders, midfielders, forwards] = await Promise.all([
      this.getRandomPlayersByPosition(PlayerPosition.GOALKEEPER, 1),
      this.getRandomPlayersByPosition(PlayerPosition.DEFENDER, 4),
      this.getRandomPlayersByPosition(PlayerPosition.MIDFIELDER, 3),
      this.getRandomPlayersByPosition(PlayerPosition.FORWARD, 3),
    ]);

    return [...goalkeepers, ...defenders, ...midfielders, ...forwards];
  }

  private async getRandomPlayersByPosition(
    position: PlayerPosition,
    count: number,
  ): Promise<PlayerResponseDto[]> {
    const players = await this.playerRepository
      .createQueryBuilder('player')
      .where('player.position = :position', { position })
      .andWhere('player.isActive = :isActive', { isActive: true })
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();

    return players;
  }
}

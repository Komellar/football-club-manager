import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerStatistics } from '@/shared/entities/player-statistics.entity';
import type {
  CreatePlayerStatisticsDto,
  UpdatePlayerStatisticsDto,
  PlayerStatisticsResponseDto,
  PlayerStatisticsQueryDto,
} from '@repo/core';
import { PaginationHelper } from '@/shared/helpers/pagination.helper';
import { PaginationResult } from '@repo/core';

@Injectable()
export class PlayerStatisticsService {
  constructor(
    @InjectRepository(PlayerStatistics)
    private statisticsRepository: Repository<PlayerStatistics>,
  ) {}

  async create(
    createStatisticsDto: CreatePlayerStatisticsDto,
  ): Promise<PlayerStatisticsResponseDto> {
    try {
      const statistics = this.statisticsRepository.create(createStatisticsDto);
      const savedStatistics = await this.statisticsRepository.save(statistics);
      return this.mapToResponseDto(savedStatistics);
    } catch {
      throw new InternalServerErrorException(
        'Failed to create player statistics',
      );
    }
  }

  async findAll(
    queryDto?: Partial<PlayerStatisticsQueryDto>,
  ): Promise<PaginationResult<PlayerStatisticsResponseDto>> {
    try {
      const queryBuilder =
        this.statisticsRepository.createQueryBuilder('stats');

      if (queryDto?.playerId) {
        queryBuilder.andWhere('stats.playerId = :playerId', {
          playerId: queryDto.playerId,
        });
      }

      if (queryDto?.season) {
        queryBuilder.andWhere('stats.season = :season', {
          season: queryDto.season,
        });
      }

      queryBuilder.orderBy('stats.season', 'DESC');

      const paginationResult = await PaginationHelper.paginate(queryBuilder, {
        page: queryDto?.page,
        limit: queryDto?.limit,
      });

      return {
        data: paginationResult.data.map((stat) => this.mapToResponseDto(stat)),
        pagination: paginationResult.pagination,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to retrieve player statistics',
      );
    }
  }

  async findOne(id: number): Promise<PlayerStatisticsResponseDto> {
    try {
      const statistics = await this.statisticsRepository.findOne({
        where: { id },
      });
      if (!statistics) {
        throw new NotFoundException(
          `Player statistics with ID ${id} not found`,
        );
      }
      return this.mapToResponseDto(statistics);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve player statistics',
      );
    }
  }

  async update(
    id: number,
    updateStatisticsDto: UpdatePlayerStatisticsDto,
  ): Promise<PlayerStatisticsResponseDto> {
    try {
      const existingStats = await this.statisticsRepository.findOne({
        where: { id },
      });
      if (!existingStats) {
        throw new NotFoundException(
          `Player statistics with ID ${id} not found`,
        );
      }

      await this.statisticsRepository.update(id, updateStatisticsDto);
      const updatedStats = await this.statisticsRepository.findOne({
        where: { id },
      });

      if (!updatedStats) {
        throw new InternalServerErrorException(
          'Failed to retrieve updated player statistics',
        );
      }

      return this.mapToResponseDto(updatedStats);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update player statistics',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const statistics = await this.statisticsRepository.findOne({
        where: { id },
      });
      if (!statistics) {
        throw new NotFoundException(
          `Player statistics with ID ${id} not found`,
        );
      }

      await this.statisticsRepository.remove(statistics);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete player statistics',
      );
    }
  }

  private mapToResponseDto(
    statistics: PlayerStatistics,
  ): PlayerStatisticsResponseDto {
    return {
      id: statistics.id,
      playerId: statistics.playerId,
      season: statistics.season,
      matchesPlayed: statistics.matchesPlayed,
      minutesPlayed: statistics.minutesPlayed,
      goals: statistics.goals,
      assists: statistics.assists,
      yellowCards: statistics.yellowCards,
      redCards: statistics.redCards,
      cleanSheets: statistics.cleanSheets,
      savesMade: statistics.savesMade,
      rating: statistics.rating,
      averageRating: statistics.averageRating,
      createdAt: statistics.createdAt,
      updatedAt: statistics.updatedAt,
    };
  }
}

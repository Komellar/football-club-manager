import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerStatistics } from '@/shared/entities/player-statistics.entity';
import { ListQueryBuilder } from '../../shared/query/list-query-builder';
import type {
  CreatePlayerStatisticsDto,
  UpdatePlayerStatisticsDto,
  PlayerStatisticsResponseDto,
  PlayerStatisticsQueryDto,
  FilterOptions,
} from '@repo/core';
import { PaginationResult, FilterMode } from '@repo/core';

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

      return savedStatistics;
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
      const filterOptions: FilterOptions = {
        defaultFilterMode: FilterMode.EXACT, // Use exact matching for statistics filters
      };
      return await ListQueryBuilder.executeQuery(
        this.statisticsRepository,
        queryDto,
        filterOptions,
      );
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

      return statistics;
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
      const exists = await this.statisticsRepository.exists({
        where: { id },
      });
      if (!exists) {
        throw new NotFoundException(
          `Player statistics with ID ${id} not found`,
        );
      }

      await this.statisticsRepository.update(id, updateStatisticsDto);
      const updatedStats = await this.statisticsRepository.findOneOrFail({
        where: { id },
      });

      return updatedStats;
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
        relations: ['player'],
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
        `Failed to delete player statistics with id ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

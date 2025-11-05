import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerStatistics } from '@/shared/entities/player-statistics.entity';
import { ListQueryBuilder } from '@/shared/query/list-query-builder';
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
    const statistics = this.statisticsRepository.create(createStatisticsDto);
    const savedStatistics = await this.statisticsRepository.save(statistics);

    return savedStatistics;
  }

  async findAll(
    queryDto?: Partial<PlayerStatisticsQueryDto>,
  ): Promise<PaginationResult<PlayerStatisticsResponseDto>> {
    const filterOptions: FilterOptions = {
      defaultFilterMode: FilterMode.EXACT, // Use exact matching for statistics filters
    };
    return await ListQueryBuilder.executeQuery(
      this.statisticsRepository,
      queryDto,
      filterOptions,
    );
  }

  async findOne(id: number): Promise<PlayerStatisticsResponseDto> {
    return await this.statisticsRepository.findOneOrFail({
      where: { id },
    });
  }

  async update(
    id: number,
    updateStatisticsDto: UpdatePlayerStatisticsDto,
  ): Promise<PlayerStatisticsResponseDto> {
    // This will throw EntityNotFoundError if not found, which global filter handles
    await this.statisticsRepository.findOneOrFail({ where: { id } });

    await this.statisticsRepository.update(id, updateStatisticsDto);
    return await this.statisticsRepository.findOneOrFail({
      where: { id },
    });
  }

  async remove(id: number): Promise<void> {
    const statistics = await this.statisticsRepository.findOneOrFail({
      where: { id },
      relations: ['player'],
    });

    await this.statisticsRepository.remove(statistics);
  }
}

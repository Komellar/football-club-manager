import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PlayerStatisticsService } from '../services/player-statistics.service';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import {
  CreatePlayerStatisticsSchema,
  UpdatePlayerStatisticsSchema,
  PlayerStatisticsQuerySchema,
  type CreatePlayerStatisticsDto,
  type UpdatePlayerStatisticsDto,
  type PlayerStatisticsResponseDto,
  type PlayerStatisticsQueryDto,
  type PaginationResult,
} from '@repo/core';
import {
  GetAllPlayerStatistics,
  GetPlayerStatisticsById,
  GetStatisticsByPlayer,
  CreatePlayerStatistics,
  UpdatePlayerStatistics,
  DeletePlayerStatistics,
} from '../decorators/player-statistics-endpoint.decorators';

@Controller('statistics')
@ApiTags('statistics')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class PlayerStatisticsController {
  constructor(
    private readonly playerStatisticsService: PlayerStatisticsService,
  ) {}

  @Get()
  @GetAllPlayerStatistics()
  async findAll(
    @Query(new ZodValidationPipe(PlayerStatisticsQuerySchema))
    queryDto?: PlayerStatisticsQueryDto,
  ): Promise<PaginationResult<PlayerStatisticsResponseDto>> {
    return this.playerStatisticsService.findAll(queryDto);
  }

  @Get(':id')
  @GetPlayerStatisticsById()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlayerStatisticsResponseDto> {
    return this.playerStatisticsService.findOne(id);
  }

  @Get('player/:playerId')
  @GetStatisticsByPlayer()
  async getPlayerStatistics(
    @Param('playerId', ParseIntPipe) playerId: number,
    @Query(new ZodValidationPipe(PlayerStatisticsQuerySchema))
    queryDto?: PlayerStatisticsQueryDto,
  ): Promise<PaginationResult<PlayerStatisticsResponseDto>> {
    return this.playerStatisticsService.findAll({
      ...queryDto,
      where: {
        ...queryDto?.where,
        playerId,
      },
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreatePlayerStatistics()
  async create(
    @Body(new ZodValidationPipe(CreatePlayerStatisticsSchema))
    createStatisticsDto: CreatePlayerStatisticsDto,
  ): Promise<PlayerStatisticsResponseDto> {
    return this.playerStatisticsService.create(createStatisticsDto);
  }

  @Patch(':id')
  @UpdatePlayerStatistics()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdatePlayerStatisticsSchema))
    updateStatisticsDto: UpdatePlayerStatisticsDto,
  ): Promise<PlayerStatisticsResponseDto> {
    return this.playerStatisticsService.update(id, updateStatisticsDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeletePlayerStatistics()
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.playerStatisticsService.remove(id);
  }
}

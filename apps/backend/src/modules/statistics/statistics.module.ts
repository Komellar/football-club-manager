import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PlayerStatistics } from '@/shared/entities/player-statistics.entity';
import { PlayerStatisticsController } from './controllers/player-statistics.controller';
import { PlayerStatisticsService } from './services/player-statistics.service';
import { MatchStatisticsProcessorService } from './services/match-statistics-processor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerStatistics]),
    JwtModule,
    ConfigModule,
  ],
  controllers: [PlayerStatisticsController],
  providers: [PlayerStatisticsService, MatchStatisticsProcessorService],
  exports: [PlayerStatisticsService, MatchStatisticsProcessorService],
})
export class StatisticsModule {}

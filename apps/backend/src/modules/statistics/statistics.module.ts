import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PlayerStatisticsController } from './player-statistics.controller';
import { PlayerStatisticsService } from './player-statistics.service';
import { PlayerStatistics } from '@/shared/entities/player-statistics.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerStatistics]),
    JwtModule,
    ConfigModule,
  ],
  controllers: [PlayerStatisticsController],
  providers: [PlayerStatisticsService],
  exports: [PlayerStatisticsService],
})
export class StatisticsModule {}

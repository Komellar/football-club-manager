import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PlayerStatistics } from '@/shared/entities/player-statistics.entity';
import { PlayerStatisticsController } from './controllers/player-statistics.controller';
import { PlayerStatisticsService } from './services/player-statistics.service';

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

import { Module } from '@nestjs/common';
import { MatchEventsService } from './services/match-events.service';
import { MatchEventsGateway } from './gateways/match-events.gateway';
import { MatchSimulationEngineService } from './services/match-simulation-engine.service';
import { PlayersModule } from '../players/players.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Player } from '@/shared/entities/player.entity';
import { LineupService } from './services/lineup.service';
import { LineupController } from './controllers/lineup.controller';

@Module({
  imports: [
    PlayersModule,
    StatisticsModule,
    TypeOrmModule.forFeature([Player]),
    JwtModule,
    ConfigModule,
  ],
  controllers: [LineupController],
  providers: [
    MatchEventsGateway,
    LineupService,
    MatchEventsService,
    MatchSimulationEngineService,
  ],
  exports: [MatchEventsService],
})
export class MatchEventsModule {}

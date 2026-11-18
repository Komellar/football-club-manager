import { Module } from '@nestjs/common';
import { MatchEventsService } from './services/match-events.service';
import { MatchEventsGateway } from './gateways/match-events.gateway';
import { MatchSimulationEngineService } from './services/match-simulation-engine.service';
import { PlayersModule } from '../players/players.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Player } from '@/shared/entities/player.entity';
import { LineupService } from './services/lineup.service';
import { LineupController } from './controllers/lineup.controller';
import { Fixture } from '@/shared/entities/fixture.entity';
import { FixturesService } from './services/fixtures.service';
import { FixturesController } from './controllers/fixtures.controller';
import { MatchHistoryController } from './controllers/match-history.controller';
import { StadiumModule } from '../stadium/stadium.module';

@Module({
  imports: [
    PlayersModule,
    StatisticsModule,
    TypeOrmModule.forFeature([Player, Fixture]),
    AuthModule,
    StadiumModule,
  ],
  controllers: [LineupController, FixturesController, MatchHistoryController],
  providers: [
    MatchEventsGateway,
    LineupService,
    FixturesService,
    MatchEventsService,
    MatchSimulationEngineService,
  ],
  exports: [MatchEventsService],
})
export class MatchEventsModule {}

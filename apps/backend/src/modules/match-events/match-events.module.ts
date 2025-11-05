import { Module } from '@nestjs/common';
import { MatchEventsService } from './services/match-events.service';
import { MatchEventsGateway } from './gateways/match-events.gateway';
import { MatchSimulationEngineService } from './services/match-simulation-engine.service';
import { PlayersModule } from '../players/players.module';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
  imports: [PlayersModule, StatisticsModule],
  providers: [
    MatchEventsGateway,
    MatchEventsService,
    MatchSimulationEngineService,
  ],
  exports: [MatchEventsService],
})
export class MatchEventsModule {}

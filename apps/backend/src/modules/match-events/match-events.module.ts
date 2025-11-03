import { Module } from '@nestjs/common';
import { MatchEventsService } from './services/match-events.service';
import { MatchEventsGateway } from './gateways/match-events.gateway';
import { MatchSimulationEngineService } from './services/match-simulation-engine.service';

@Module({
  providers: [
    MatchEventsGateway,
    MatchEventsService,
    MatchSimulationEngineService,
  ],
  exports: [MatchEventsService],
})
export class MatchEventsModule {}

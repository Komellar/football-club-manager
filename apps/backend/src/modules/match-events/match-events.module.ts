import { Module } from '@nestjs/common';
import { MatchEventsService } from './match-events.service';
import { MatchEventsGateway } from './match-events.gateway';

@Module({
  providers: [MatchEventsGateway, MatchEventsService],
  exports: [MatchEventsService],
})
export class MatchEventsModule {}

import { Controller, Get } from '@nestjs/common';
import { LineupService } from '../services/lineup.service';

@Controller('match-lineup')
export class LineupController {
  constructor(private readonly lineups: LineupService) {}

  @Get()
  candidates() {
    return this.lineups.candidates();
  }
}

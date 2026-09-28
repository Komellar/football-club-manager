import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { LineupService } from '../services/lineup.service';

@Controller('match-lineup')
@UseGuards(AuthGuard)
export class LineupController {
  constructor(private readonly lineups: LineupService) {}

  @Get()
  candidates() {
    return this.lineups.candidates();
  }
}

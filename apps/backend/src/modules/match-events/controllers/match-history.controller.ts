import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { MatchHistoryQuerySchema } from '@repo/core';
import type { MatchHistoryQuery } from '@repo/core';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { FixturesService } from '../services/fixtures.service';

@Controller('match-history')
export class MatchHistoryController {
  constructor(private readonly fixtures: FixturesService) {}
  @Get(':id') report(@Param('id', ParseUUIDPipe) id: string) {
    return this.fixtures.report(id);
  }
  @Get() list(
    @Query(new ZodValidationPipe(MatchHistoryQuerySchema))
    query: MatchHistoryQuery,
  ) {
    return this.fixtures.history(query);
  }
}

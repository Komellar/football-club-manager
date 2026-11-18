import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateFixtureSchema, UpdateFixtureSchema } from '@repo/core';
import type { CreateFixtureDto, UpdateFixtureDto } from '@repo/core';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { FixturesService } from '../services/fixtures.service';

@Controller('fixtures')
export class FixturesController {
  constructor(private readonly fixtures: FixturesService) {}
  @Get() list() {
    return this.fixtures.list();
  }
  @Get(':id') find(@Param('id', ParseUUIDPipe) id: string) {
    return this.fixtures.find(id);
  }
  @Post() create(
    @Body(new ZodValidationPipe(CreateFixtureSchema)) data: CreateFixtureDto,
  ) {
    return this.fixtures.create(data);
  }
  @Patch(':id') update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateFixtureSchema)) data: UpdateFixtureDto,
  ) {
    return this.fixtures.update(id, data);
  }
  @Post(':id/cancel') cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.fixtures.cancel(id);
  }
}

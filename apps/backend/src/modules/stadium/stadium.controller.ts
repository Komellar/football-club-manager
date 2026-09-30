import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { StadiumSettingsSchema } from '@repo/core';
import type { StadiumSettings } from '@repo/core';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { StadiumService } from './stadium.service';

@Controller('stadium')
@UseGuards(AuthGuard)
export class StadiumController {
  constructor(private readonly stadium: StadiumService) {}
  @Get() get() {
    return this.stadium.get();
  }
  @Put() save(
    @Body(new ZodValidationPipe(StadiumSettingsSchema)) data: StadiumSettings,
  ) {
    return this.stadium.save(data);
  }
}

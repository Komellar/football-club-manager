import { Body, Controller, Get, Put } from '@nestjs/common';
import { StadiumSettingsSchema } from '@repo/core';
import type { StadiumSettings } from '@repo/core';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { StadiumService } from './stadium.service';

@Controller('stadium')
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

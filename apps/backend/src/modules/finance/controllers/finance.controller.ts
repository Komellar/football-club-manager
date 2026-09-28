import { Controller, Get, Query, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from '../services/finance.service';
import { FinancePeriodQuerySchema, FinancialSummary } from '@repo/core';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { AuthGuard } from '@/shared/guards/auth.guard';

@Controller('finance')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('summary')
  @UsePipes(new ZodValidationPipe(FinancePeriodQuerySchema))
  async getSummary(
    @Query() query: { startDate: Date; endDate: Date },
  ): Promise<FinancialSummary> {
    return this.financeService.getFinancialSummary(
      query.startDate,
      query.endDate,
    );
  }
}

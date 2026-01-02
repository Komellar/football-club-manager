import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { FinanceService } from '../services/finance.service';
import { FinancialSummary, FinancePeriodQuerySchema } from '@repo/core';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';

@Controller('finance')
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

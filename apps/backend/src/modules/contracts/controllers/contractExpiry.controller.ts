import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { CONTRACT_CONSTANTS } from '../constants/contract.constants';
import { ContractExpiryService } from '../services';
import {
  ExpiryQuery,
  ExpiryQuerySchema,
  ReportQuery,
  ReportQuerySchema,
} from '@repo/core';

@Controller('contracts/expiry')
@UseGuards(AuthGuard)
export class ContractExpiryController {
  constructor(private readonly contractExpiryService: ContractExpiryService) {}

  @Get('expiring')
  async findExpiringContracts(
    @Query(new ZodValidationPipe(ExpiryQuerySchema)) query: ExpiryQuery,
  ) {
    const days = query.days ?? CONTRACT_CONSTANTS.EXPIRY.DEFAULT_DAYS;
    return await this.contractExpiryService.findExpiringContracts(days);
  }

  @Get('recently-expired')
  async getRecentlyExpiredContracts(
    @Query(new ZodValidationPipe(ReportQuerySchema)) query: ReportQuery,
  ) {
    const days = query.days ?? CONTRACT_CONSTANTS.EXPIRY.DEFAULT_DAYS;
    return await this.contractExpiryService.getRecentlyExpiredContracts(days);
  }
}

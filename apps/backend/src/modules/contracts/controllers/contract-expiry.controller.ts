import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/core/auth/auth.guard';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { CONTRACT_CONSTANTS } from '../constants/contract.constants';
import { ContractExpiryService } from '../services';
import {
  ExpiryQueryDto,
  ExpiryQuerySchema,
  ReportQueryDto,
  ReportQuerySchema,
} from '@repo/core';

@Controller('contracts/expiry')
@UseGuards(AuthGuard)
export class ContractExpiryController {
  constructor(private readonly contractExpiryService: ContractExpiryService) {}

  @Get('expiring')
  async findExpiringContracts(
    @Query(new ZodValidationPipe(ExpiryQuerySchema)) query: ExpiryQueryDto,
  ) {
    const days = query.days ?? CONTRACT_CONSTANTS.EXPIRY.DEFAULT_DAYS;
    return await this.contractExpiryService.findExpiringContracts(days);
  }

  @Get('recently-expired')
  async getRecentlyExpiredContracts(
    @Query(new ZodValidationPipe(ReportQuerySchema)) query: ReportQueryDto,
  ) {
    const days = query.days ?? CONTRACT_CONSTANTS.EXPIRY.DEFAULT_DAYS;
    return await this.contractExpiryService.getRecentlyExpiredContracts(days);
  }
}

import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/core/auth/auth.guard';
import { ContractFinancialService } from '../services';
import {
  type ContractValueCalculation,
  type ContractFinancialSummary,
} from '@repo/core';

@Controller('contracts/financial')
@UseGuards(AuthGuard)
export class ContractFinancialController {
  constructor(
    private readonly contractFinancialService: ContractFinancialService,
  ) {}

  @Get('summary')
  async getFinancialSummary(): Promise<ContractFinancialSummary> {
    return await this.contractFinancialService.getFinancialSummary();
  }

  @Get(':id/value-calculation')
  async calculateContractValue(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ContractValueCalculation> {
    return await this.contractFinancialService.calculateContractValue(id);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { Contract } from '@/shared/entities/contract.entity';
import { ContractsController } from './controllers/contracts.controller';
import { ContractExpiryController } from './controllers/contract-expiry.controller';
import { ContractFinancialController } from './controllers/contract-financial.controller';
import { ContractsService } from './services/contracts.service';
import { ContractExpiryService } from './services/contract-expiry.service';
import { ContractFinancialService } from './services/contract-financial.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contract]), JwtModule, ConfigModule],
  controllers: [
    ContractsController,
    ContractExpiryController,
    ContractFinancialController,
  ],
  providers: [
    ContractsService,
    ContractExpiryService,
    ContractFinancialService,
  ],
  exports: [ContractsService, ContractExpiryService, ContractFinancialService],
})
export class ContractsModule {}

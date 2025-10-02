import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { Contract } from '@/shared/entities/contract.entity';
import { ContractsController } from './controllers/contracts.controller';
import { ContractExpiryController } from './controllers/contractExpiry.controller';
import { ContractFinancialController } from './controllers/contractFinancial.controller';
import { ContractsService } from './services/contracts.service';
import { ContractExpiryService } from './services/contractExpiry.service';
import { ContractFinancialService } from './services/contractFinancial.service';

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

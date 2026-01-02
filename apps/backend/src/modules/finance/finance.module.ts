import { Module } from '@nestjs/common';
import { FinanceController } from './controllers/finance.controller';
import { FinanceService } from './services/finance.service';
import { ContractsModule } from '../contracts/contracts.module';
import { TransfersModule } from '../transfers/transfers.module';

@Module({
  imports: [ContractsModule, TransfersModule],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}

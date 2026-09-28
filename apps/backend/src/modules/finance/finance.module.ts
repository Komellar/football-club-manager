import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { FinanceController } from './controllers/finance.controller';
import { FinanceService } from './services/finance.service';
import { ContractsModule } from '../contracts/contracts.module';
import { TransfersModule } from '../transfers/transfers.module';
import { SponsorshipsModule } from '../sponsorships/sponsorships.module';

@Module({
  imports: [
    JwtModule,
    ConfigModule,
    ContractsModule,
    TransfersModule,
    SponsorshipsModule,
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}

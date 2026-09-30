import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { FinanceController } from './controllers/finance.controller';
import { FinanceService } from './services/finance.service';
import { ContractsModule } from '../contracts/contracts.module';
import { TransfersModule } from '../transfers/transfers.module';
import { SponsorshipsModule } from '../sponsorships/sponsorships.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fixture } from '@/shared/entities/fixture.entity';
import { StadiumMaintenanceRate } from '@/shared/entities/stadium-maintenance-rate.entity';
import { StadiumFinancialService } from './services/stadium-financial.service';

@Module({
  imports: [
    JwtModule,
    ConfigModule,
    ContractsModule,
    TransfersModule,
    SponsorshipsModule,
    TypeOrmModule.forFeature([Fixture, StadiumMaintenanceRate]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService, StadiumFinancialService],
  exports: [FinanceService],
})
export class FinanceModule {}

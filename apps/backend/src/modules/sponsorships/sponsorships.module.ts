import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Sponsorship } from '@/shared/entities/sponsorship.entity';
import { SponsorshipsController } from './controllers/sponsorships.controller';
import { SponsorshipsService } from './services/sponsorships.service';
import { SponsorshipFinancialService } from './services/sponsorship-financial.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sponsorship]), JwtModule, ConfigModule],
  controllers: [SponsorshipsController],
  providers: [SponsorshipsService, SponsorshipFinancialService],
  exports: [SponsorshipsService, SponsorshipFinancialService],
})
export class SponsorshipsModule {}

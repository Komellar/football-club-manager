import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Sponsorship } from '@/shared/entities/sponsorship.entity';
import { SponsorshipsController } from './controllers/sponsorships.controller';
import { SponsorshipsService } from './services/sponsorships.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sponsorship]), JwtModule, ConfigModule],
  controllers: [SponsorshipsController],
  providers: [SponsorshipsService],
  exports: [SponsorshipsService],
})
export class SponsorshipsModule {}

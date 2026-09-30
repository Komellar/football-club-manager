import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Stadium } from '@/shared/entities/stadium.entity';
import { StadiumController } from './stadium.controller';
import { StadiumService } from './stadium.service';
import { StadiumMaintenanceRate } from '@/shared/entities/stadium-maintenance-rate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stadium, StadiumMaintenanceRate]),
    JwtModule,
    ConfigModule,
  ],
  controllers: [StadiumController],
  providers: [StadiumService],
  exports: [StadiumService],
})
export class StadiumModule {}

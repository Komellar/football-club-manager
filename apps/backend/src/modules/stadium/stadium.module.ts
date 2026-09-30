import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Stadium } from '@/shared/entities/stadium.entity';
import { StadiumController } from './stadium.controller';
import { StadiumService } from './stadium.service';

@Module({
  imports: [TypeOrmModule.forFeature([Stadium]), JwtModule, ConfigModule],
  controllers: [StadiumController],
  providers: [StadiumService],
  exports: [StadiumService],
})
export class StadiumModule {}

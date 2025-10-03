import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Transfer } from '@/shared/entities/transfer.entity';
import { Player } from '@/shared/entities/player.entity';
import { TransfersController } from './controllers/transfers.controller';
import { TransfersService } from './services/transfers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transfer, Player]),
    JwtModule,
    ConfigModule,
  ],
  controllers: [TransfersController],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}

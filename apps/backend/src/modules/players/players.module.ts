import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Player } from '@/shared/entities/player.entity';
import { PlayersController } from './controllers/players.controller';
import { PlayersService } from './services/players.service';

@Module({
  imports: [TypeOrmModule.forFeature([Player]), JwtModule, ConfigModule],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}

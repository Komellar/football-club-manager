import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './core/database/database.config';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './core/auth/auth.module';
import { PlayersModule } from './modules/players/players.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { ContractsModule } from './modules/contracts/contracts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    PlayersModule,
    StatisticsModule,
    TransfersModule,
    ContractsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

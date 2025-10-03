import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User, Role, Contract } from '../shared/entities';
import { Player } from '../shared/entities/player.entity';
import { PlayerStatistics } from '../shared/entities/player-statistics.entity';
import { Transfer } from '../shared/entities/transfer.entity';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [User, Role, Player, PlayerStatistics, Transfer, Contract],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: 'typeorm_migrations',
  logging: configService.get('NODE_ENV') === 'development',
});

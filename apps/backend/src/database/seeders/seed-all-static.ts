import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';
import * as bcrypt from 'bcrypt';
import {
  User,
  Player,
  Contract,
  Transfer,
  PlayerStatistics,
} from '@/shared/entities';
import {
  ContractType,
  ContractStatus,
  PlayerPosition,
  TransferType,
  TransferStatus,
  RoleType,
} from '@repo/core';
import { staticPlayers } from './data';

// Load environment variables
config({ path: join(__dirname, '../../../.env') });

const configService = new ConfigService();

// Database configuration
const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [User, Player, Contract, Transfer, PlayerStatistics],
  synchronize: false,
});

async function seedDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Clear existing data (in reverse order of dependencies)
    console.log(' Clearing existing data...');
    await AppDataSource.query('TRUNCATE TABLE player_statistics CASCADE');
    await AppDataSource.query('TRUNCATE TABLE transfers CASCADE');
    await AppDataSource.query('TRUNCATE TABLE contracts CASCADE');
    await AppDataSource.query('TRUNCATE TABLE players CASCADE');
    await AppDataSource.query('TRUNCATE TABLE users CASCADE');
    console.log('Existing data cleared');

    // Seed Test User
    console.log('Seeding test user...');
    const userRepo = AppDataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = userRepo.create({
      name: 'John Doe',
      email: 'test@test.com',
      passwordHash: hashedPassword,
      role: RoleType.ADMIN,
    });
    await userRepo.save(testUser);
    console.log('Test user created (test@test.com / test123)');

    // 3. Seed Players
    console.log('Seeding players...');
    const playerRepo = AppDataSource.getRepository(Player);
    const players: Player[] = [];

    for (const staticPlayer of staticPlayers) {
      const player = playerRepo.create({
        name: staticPlayer.name,
        position: staticPlayer.position,
        dateOfBirth: staticPlayer.dateOfBirth,
        country: staticPlayer.country,
        height: staticPlayer.height,
        weight: staticPlayer.weight,
        jerseyNumber: staticPlayer.jerseyNumber,
        marketValue: staticPlayer.marketValue,
        isActive: staticPlayer.isActive,
      });
      players.push(player);
    }

    await playerRepo.save(players);
    console.log(`${players.length} players seeded`);

    // 4. Seed Contracts
    console.log('Seeding contracts...');
    const contractRepo = AppDataSource.getRepository(Contract);
    const contracts: Contract[] = [];

    // Map static player data to saved players by name
    const playerMap = new Map<string, Player>();
    for (const player of players) {
      playerMap.set(player.name, player);
    }

    // Create contracts for each player based on static data
    for (const staticPlayer of staticPlayers) {
      const player = playerMap.get(staticPlayer.name);
      if (!player) continue;

      // Current contract
      const currentContract = contractRepo.create({
        playerId: player.id,
        contractType: staticPlayer.contractType,
        status: staticPlayer.contractStatus,
        startDate: staticPlayer.contractStart,
        endDate: staticPlayer.contractEnd,
        salary: staticPlayer.salary,
        bonuses: staticPlayer.bonuses,
        signOnFee: staticPlayer.signOnFee,
        releaseClause: staticPlayer.releaseClause,
        agentFee: staticPlayer.agentFee,
        notes: 'Current contract',
      });
      contracts.push(currentContract);

      // Add historical contracts for active players (3 total: 1 current + 2 historical)
      if (staticPlayer.isActive) {
        // First historical contract (2 years before current)
        const hist1Start = new Date(staticPlayer.contractStart);
        hist1Start.setFullYear(hist1Start.getFullYear() - 4);
        const hist1End = new Date(hist1Start);
        hist1End.setFullYear(hist1End.getFullYear() + 2);

        const historical1 = contractRepo.create({
          playerId: player.id,
          contractType: ContractType.PERMANENT,
          status: ContractStatus.EXPIRED,
          startDate: hist1Start,
          endDate: hist1End,
          salary: Math.floor(staticPlayer.salary * 0.6),
          bonuses: Math.floor(staticPlayer.bonuses * 0.6),
          signOnFee: Math.floor(staticPlayer.signOnFee * 0.5),
          releaseClause: staticPlayer.releaseClause
            ? Math.floor(staticPlayer.releaseClause * 0.7)
            : undefined,
          agentFee: Math.floor(staticPlayer.agentFee * 0.5),
          notes: 'Historical contract #1',
        });
        contracts.push(historical1);

        // Second historical contract (right before current)
        const hist2Start = new Date(staticPlayer.contractStart);
        hist2Start.setFullYear(hist2Start.getFullYear() - 2);
        const hist2End = new Date(staticPlayer.contractStart);
        hist2End.setDate(hist2End.getDate() - 1);

        const historical2 = contractRepo.create({
          playerId: player.id,
          contractType: ContractType.PERMANENT,
          status: ContractStatus.EXPIRED,
          startDate: hist2Start,
          endDate: hist2End,
          salary: Math.floor(staticPlayer.salary * 0.8),
          bonuses: Math.floor(staticPlayer.bonuses * 0.8),
          signOnFee: Math.floor(staticPlayer.signOnFee * 0.7),
          releaseClause: staticPlayer.releaseClause
            ? Math.floor(staticPlayer.releaseClause * 0.85)
            : undefined,
          agentFee: Math.floor(staticPlayer.agentFee * 0.7),
          notes: 'Historical contract #2',
        });
        contracts.push(historical2);
      } else {
        // Add 1 historical contract for inactive players (2 total: 1 current + 1 historical)
        const hist1Start = new Date(staticPlayer.contractStart);
        hist1Start.setFullYear(hist1Start.getFullYear() - 3);
        const hist1End = new Date(hist1Start);
        hist1End.setFullYear(hist1End.getFullYear() + 2);

        const historical1 = contractRepo.create({
          playerId: player.id,
          contractType: ContractType.PERMANENT,
          status: ContractStatus.EXPIRED,
          startDate: hist1Start,
          endDate: hist1End,
          salary: Math.floor(staticPlayer.salary * 0.7),
          bonuses: Math.floor(staticPlayer.bonuses * 0.7),
          signOnFee: Math.floor(staticPlayer.signOnFee * 0.6),
          releaseClause: staticPlayer.releaseClause
            ? Math.floor(staticPlayer.releaseClause * 0.75)
            : undefined,
          agentFee: Math.floor(staticPlayer.agentFee * 0.6),
          notes: 'Historical contract',
        });
        contracts.push(historical1);
      }
    }

    await contractRepo.save(contracts);
    console.log(`${contracts.length} contracts seeded`);

    // 5. Seed Transfers
    console.log('Seeding transfers...');
    const transferRepo = AppDataSource.getRepository(Transfer);
    const transfers: Transfer[] = [];

    // Create one transfer per player (their arrival to the club)
    for (const player of players) {
      const staticPlayer = staticPlayers.find((sp) => sp.name === player.name);
      if (!staticPlayer) continue;

      const transfer = transferRepo.create({
        playerId: player.id,
        fromClub: 'Previous Club',
        toClub: 'Our Club',
        transferType: TransferType.SIGNING,
        transferStatus: TransferStatus.COMPLETED,
        transferDate: staticPlayer.contractStart,
        transferFee: Math.floor(staticPlayer.marketValue * 0.8),
        agentFee: staticPlayer.agentFee,
        annualSalary: staticPlayer.salary * 12,
        contractLengthMonths: Math.floor(
          (staticPlayer.contractEnd.getTime() -
            staticPlayer.contractStart.getTime()) /
            (1000 * 60 * 60 * 24 * 30),
        ),
        isPermanent: staticPlayer.contractType === ContractType.PERMANENT,
        createdBy: testUser.email,
        notes: `Transfer from Previous Club`,
      });
      transfers.push(transfer);
    }

    await transferRepo.save(transfers);
    console.log(`${transfers.length} transfers seeded`);

    // 6. Seed Player Statistics
    console.log('Seeding player statistics...');
    const statsRepo = AppDataSource.getRepository(PlayerStatistics);
    const statistics: PlayerStatistics[] = [];
    const activePlayers = players.filter((p) => p.isActive);

    // Generate stats only for active players
    for (const player of activePlayers) {
      // Each player gets stats for 2 recent seasons
      for (let i = 3; i < 5; i++) {
        const season = '2024-2025';
        const minutesPlayed = Math.floor(Math.random() * 31) + 60; // 60-90 minutes

        const stats = new PlayerStatistics();
        stats.playerId = player.id;
        stats.season = season;
        stats.minutesPlayed = minutesPlayed;

        // Position-based stats
        if (player.position === PlayerPosition.FORWARD) {
          stats.goals = Math.random() > 0.7 ? 1 : 0; // 30% chance of scoring
          stats.assists = Math.random() > 0.8 ? 1 : 0; // 20% chance of assist
          stats.shotsOnTarget = Math.floor(Math.random() * 4) + 1; // 1-4
          stats.shotsOffTarget = Math.floor(Math.random() * 3); // 0-2
        } else if (player.position === PlayerPosition.MIDFIELDER) {
          stats.goals = Math.random() > 0.85 ? 1 : 0; // 15% chance of scoring
          stats.assists = Math.random() > 0.7 ? 1 : 0; // 30% chance of assist
          stats.shotsOnTarget = Math.floor(Math.random() * 3); // 0-2
          stats.shotsOffTarget = Math.floor(Math.random() * 2); // 0-1
        } else if (player.position === PlayerPosition.DEFENDER) {
          stats.goals = Math.random() > 0.95 ? 1 : 0; // 5% chance of scoring
          stats.assists = Math.random() > 0.9 ? 1 : 0; // 10% chance of assist
          stats.shotsOnTarget = Math.floor(Math.random() * 2); // 0-1
          stats.shotsOffTarget = Math.floor(Math.random() * 2); // 0-1
        } else {
          // Goalkeeper
          stats.goals = 0;
          stats.assists = 0;
          stats.savesMade = Math.floor(Math.random() * 6) + 2; // 2-7 saves
          stats.goalsConceded = Math.floor(Math.random() * 3); // 0-2 goals conceded
          stats.shotsOnTarget = 0;
          stats.shotsOffTarget = 0;
        }

        // Cards (per match): 0-1 yellow, 0-1 red (rare)
        stats.yellowCards = Math.random() > 0.8 ? 1 : 0; // 20% chance
        stats.redCards = Math.random() > 0.98 ? 1 : 0; // 2% chance
        stats.fouls = Math.floor(Math.random() * 4); // 0-3 fouls
        stats.rating = Math.floor((Math.random() * 3 + 6) * 10) / 10; // 6.0-9.0

        statistics.push(stats);
      }
    }

    await statsRepo.save(statistics);
    console.log(`${statistics.length} player statistics seeded`);

    console.log('\nDatabase seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`   - Roles: 2`);
    console.log(`   - Users: 1 (test@test.com / test123)`);
    console.log(
      `   - Players: ${players.length} (${activePlayers.length} active)`,
    );
    console.log(`   - Contracts: ${contracts.length}`);
    console.log(`   - Transfers: ${transfers.length}`);
    console.log(`   - Statistics: ${statistics.length}`);
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('\nDatabase connection closed');
  }
}

// Run the seeder
seedDatabase()
  .then(() => {
    console.log('Seeding process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding process failed:', error);
    process.exit(1);
  });

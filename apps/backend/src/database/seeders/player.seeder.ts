import { DataSource } from 'typeorm';
import { Player } from '@/shared/entities/player.entity';
import { PlayerPosition } from '@repo/core';

export async function seedPlayers(dataSource: DataSource): Promise<void> {
  const playerRepository = dataSource.getRepository(Player);

  const existingPlayers = await playerRepository.count();
  if (existingPlayers > 0) {
    console.log('Players already exist, skipping seed');
    return;
  }

  const players = [
    {
      name: 'Lionel Messi',
      position: PlayerPosition.FORWARD,
      dateOfBirth: new Date('1987-06-24'),
      nationality: 'Argentina',
      height: 170,
      weight: 72,
      jerseyNumber: 10,
      marketValue: 30000000,
      isActive: true,
    },
    {
      name: 'Virgil van Dijk',
      position: PlayerPosition.DEFENDER,
      dateOfBirth: new Date('1991-07-08'),
      nationality: 'Netherlands',
      height: 195,
      weight: 92,
      jerseyNumber: 4,
      marketValue: 45000000,
      isActive: true,
    },
    {
      name: 'Kevin De Bruyne',
      position: PlayerPosition.MIDFIELDER,
      dateOfBirth: new Date('1991-06-28'),
      nationality: 'Belgium',
      height: 181,
      weight: 70,
      jerseyNumber: 17,
      marketValue: 80000000,
      isActive: true,
    },
    {
      name: 'Alisson Becker',
      position: PlayerPosition.GOALKEEPER,
      dateOfBirth: new Date('1993-10-02'),
      nationality: 'Brazil',
      height: 191,
      weight: 86,
      jerseyNumber: 1,
      marketValue: 50000000,
      isActive: true,
    },
    {
      name: 'Erling Haaland',
      position: PlayerPosition.FORWARD,
      dateOfBirth: new Date('2000-07-21'),
      nationality: 'Norway',
      height: 194,
      weight: 88,
      jerseyNumber: 9,
      marketValue: 120000000,
      isActive: true,
    },
    {
      name: 'Pedri',
      position: PlayerPosition.MIDFIELDER,
      dateOfBirth: new Date('2002-11-25'),
      nationality: 'Spain',
      height: 174,
      weight: 60,
      jerseyNumber: 8,
      marketValue: 90000000,
      isActive: true,
    },
    {
      name: 'Joao Cancelo',
      position: PlayerPosition.DEFENDER,
      dateOfBirth: new Date('1994-05-27'),
      nationality: 'Portugal',
      height: 182,
      weight: 74,
      jerseyNumber: 2,
      marketValue: 55000000,
      isActive: true,
    },
    {
      name: 'Thibaut Courtois',
      position: PlayerPosition.GOALKEEPER,
      dateOfBirth: new Date('1992-05-11'),
      nationality: 'Belgium',
      height: 200,
      weight: 96,
      jerseyNumber: 13,
      marketValue: 35000000,
      isActive: true,
    },
    {
      name: 'Vinicius Junior',
      position: PlayerPosition.FORWARD,
      dateOfBirth: new Date('2000-07-12'),
      nationality: 'Brazil',
      height: 176,
      weight: 73,
      jerseyNumber: 7,
      marketValue: 100000000,
      isActive: true,
    },
    {
      name: 'Luka Modric',
      position: PlayerPosition.MIDFIELDER,
      dateOfBirth: new Date('1985-09-09'),
      nationality: 'Croatia',
      height: 172,
      weight: 66,
      jerseyNumber: 14,
      marketValue: 10000000,
      isActive: false, // Older player marked as inactive for demo
    },
  ];

  for (const playerData of players) {
    const player = playerRepository.create(playerData);
    await playerRepository.save(player);
    console.log(`Created player: ${playerData.name}`);
  }

  console.log('Player seeding completed');
}

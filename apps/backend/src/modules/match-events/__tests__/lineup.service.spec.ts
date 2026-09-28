import { LineupService } from '../services/lineup.service';
import { PlayerPosition } from '@repo/core';
import { Player } from '@/shared/entities/player.entity';
import { Repository } from 'typeorm';

describe('LineupService', () => {
  const players = Array.from({ length: 11 }, (_, i) => ({
    id: i + 1,
    name: `Player ${i}`,
    isActive: true,
    position: i === 0 ? PlayerPosition.GOALKEEPER : PlayerPosition.MIDFIELDER,
  }));
  const repository = { findBy: jest.fn() };
  const service = new LineupService(
    repository as unknown as Repository<Player>,
  );
  beforeEach(() => repository.findBy.mockResolvedValue(players));
  it('resolves the selected order from stored player records', async () => {
    const ids = players.map((p) => p.id).reverse();
    expect((await service.resolve(ids)).map((p) => p.id)).toEqual(ids);
  });
  it('rejects duplicated players', async () => {
    await expect(service.resolve(Array(11).fill(1))).rejects.toThrow(
      'distinct',
    );
  });
  it('rejects missing or inactive players', async () => {
    repository.findBy.mockResolvedValue(players.slice(1));
    await expect(service.resolve(players.map((p) => p.id))).rejects.toThrow(
      'active',
    );
  });
  it('rejects a lineup without exactly one goalkeeper', async () => {
    repository.findBy.mockResolvedValue(
      players.map((p) => ({ ...p, position: PlayerPosition.FORWARD })),
    );
    await expect(service.resolve(players.map((p) => p.id))).rejects.toThrow(
      'goalkeeper',
    );
  });
});

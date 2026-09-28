import { Repository } from 'typeorm';
import { Fixture } from '@/shared/entities/fixture.entity';
import { FixturesService } from '../services/fixtures.service';
import { LineupService } from '../services/lineup.service';

describe('FixturesService', () => {
  const repo = {
    update: jest.fn(),
    findOneByOrFail: jest.fn(),
    findOneOrFail: jest.fn(),
    save: jest.fn(),
    manager: { transaction: jest.fn() },
  };
  const lineups = { resolve: jest.fn() };
  const service = new FixturesService(
    repo as unknown as Repository<Fixture>,
    lineups as unknown as LineupService,
  );
  beforeEach(() => {
    jest.resetAllMocks();
    repo.manager.transaction.mockImplementation(
      (fn: (manager: unknown) => unknown) => fn({ getRepository: () => repo }),
    );
    repo.save.mockImplementation((f: Fixture) => Promise.resolve(f));
    lineups.resolve.mockResolvedValue([{ id: 1 }]);
  });
  it('marks unfinished matches as interrupted on restart', async () => {
    await service.onModuleInit();
    expect(repo.update).toHaveBeenCalledWith(
      { status: 'in_progress' },
      { status: 'interrupted' },
    );
  });
  it('claims a saved fixture under a row lock and revalidates its lineup', async () => {
    repo.findOneOrFail.mockResolvedValue({
      id: 'fixture',
      status: 'scheduled',
      lineup: [{ id: 1 }],
    });
    expect((await service.claim('fixture')).status).toBe('in_progress');
    expect(repo.findOneOrFail).toHaveBeenCalledWith({
      where: { id: 'fixture' },
      lock: { mode: 'pessimistic_write' },
    });
    expect(lineups.resolve).toHaveBeenCalledWith([1]);
  });
  it.each(['completed', 'cancelled', 'in_progress'])(
    'does not start a %s fixture',
    async (status) => {
      repo.findOneOrFail.mockResolvedValue({ status, lineup: [] });
      await expect(service.claim('fixture')).rejects.toThrow(
        'cannot be started',
      );
      expect(repo.save).not.toHaveBeenCalled();
    },
  );
  it('does not claim a fixture if its players are no longer eligible', async () => {
    repo.findOneOrFail.mockResolvedValue({
      status: 'scheduled',
      lineup: [{ id: 1 }],
    });
    lineups.resolve.mockRejectedValue(new Error('Inactive player'));
    await expect(service.claim('fixture')).rejects.toThrow('Inactive player');
    expect(repo.save).not.toHaveBeenCalled();
  });
  it('rejects an edit if kickoff claimed the fixture first', async () => {
    repo.findOneByOrFail.mockResolvedValue({ id: 'fixture' });
    repo.update.mockResolvedValue({ affected: 0 });
    await expect(
      service.update('fixture', { opponentName: 'Changed' }),
    ).rejects.toThrow('Only scheduled');
  });
});

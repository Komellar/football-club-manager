import { Repository } from 'typeorm';
import { Fixture } from '@/shared/entities/fixture.entity';
import { FixturesService } from '../services/fixtures.service';
import { LineupService } from '../services/lineup.service';
import { StadiumService } from '../../stadium/stadium.service';
import {
  MatchHistoryQuerySchema,
  UpdateFixtureSchema,
  type MatchSimulationState,
} from '@repo/core';

describe('FixturesService', () => {
  it('does not reset competition when saving only a lineup', () => {
    expect(UpdateFixtureSchema.parse({ lineupIds: [1, 2] })).toEqual({
      lineupIds: [1, 2],
    });
    expect(UpdateFixtureSchema.parse({})).toEqual({});
  });
  const repo = {
    update: jest.fn(),
    findOneByOrFail: jest.fn(),
    findOneOrFail: jest.fn(),
    save: jest.fn(),
    manager: { transaction: jest.fn() },
  };
  const lineups = { resolve: jest.fn() };
  const stadium = { get: jest.fn() };
  const service = new FixturesService(
    repo as unknown as Repository<Fixture>,
    lineups as unknown as LineupService,
    stadium as unknown as StadiumService,
  );
  beforeEach(() => {
    jest.resetAllMocks();
    repo.manager.transaction.mockImplementation(
      (fn: (manager: unknown) => unknown) => fn({ getRepository: () => repo }),
    );
    repo.save.mockImplementation((f: Fixture) => Promise.resolve(f));
    lineups.resolve.mockResolvedValue([{ id: 1 }]);
    stadium.get.mockResolvedValue(null);
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
  it('snapshots the current stadium and ticket override when claiming a fixture', async () => {
    const settings = {
      name: 'Original Ground',
      capacity: 10000,
      defaultTicketPrice: 20,
      expectedOccupancy: 60,
      monthlyMaintenance: 1000,
      securityCost: 200,
      staffingCost: 300,
      cleaningCost: 100,
      utilitiesCost: 50,
    };
    stadium.get.mockResolvedValue(settings);
    repo.findOneOrFail.mockResolvedValue({
      status: 'scheduled',
      lineup: [{ id: 1 }],
      ticketPrice: 40,
    });
    const claimed = await service.claim('fixture');
    expect(claimed.matchday).toMatchObject({
      stadium: settings,
      ticketPrice: 40,
      expectedAttendance: 4000,
      operatingCosts: 650,
    });
    expect(claimed.matchday!.attendance).toBeGreaterThanOrEqual(3600);
    expect(claimed.matchday!.attendance).toBeLessThanOrEqual(4400);
  });
  it('rejects an edit if kickoff claimed the fixture first', async () => {
    repo.findOneByOrFail.mockResolvedValue({ id: 'fixture' });
    repo.update.mockResolvedValue({ affected: 0 });
    await expect(
      service.update('fixture', { opponentName: 'Changed' }),
    ).rejects.toThrow('Only scheduled');
  });

  it('returns the archived lineup and event data without resolving current players', async () => {
    const result = {
      matchId: 'archived-match',
      homeTeam: { players: [{ id: 1, name: 'Name at kickoff' }] },
      events: [{ id: 'archived-event' }],
    };
    repo.findOneByOrFail.mockResolvedValue({
      id: 'fixture',
      status: 'completed',
      kickoffAt: new Date('2026-10-01T18:00:00Z'),
      completedAt: new Date('2026-10-01T20:00:00Z'),
      result,
    });
    expect((await service.report('fixture')).result).toEqual(result);
    expect(repo.findOneByOrFail).toHaveBeenCalledWith({
      id: 'fixture',
      status: 'completed',
    });
    expect(lineups.resolve).not.toHaveBeenCalled();
  });

  it('rejects a report without a completed result', async () => {
    repo.findOneByOrFail.mockResolvedValue({ result: null });
    await expect(service.report('fixture')).rejects.toThrow(
      'No completed match report',
    );
  });

  it('accepts a retry after the same match result was already saved', async () => {
    repo.update.mockResolvedValue({ affected: 0 });
    repo.findOneByOrFail.mockResolvedValue({
      status: 'completed',
      result: { matchId: 'same-match' },
    });
    await expect(
      service.complete('fixture', {
        matchId: 'same-match',
      } as MatchSimulationState),
    ).resolves.toBeUndefined();
    await expect(
      service.complete('fixture', {
        matchId: 'different-match',
      } as MatchSimulationState),
    ).rejects.toThrow('no longer in progress');
  });

  it.each([
    { page: 0 },
    { limit: 101 },
    { outcome: 'unknown' },
    { page: 'abc' },
  ])('rejects invalid history filters %j', (query) => {
    expect(MatchHistoryQuerySchema.safeParse(query).success).toBe(false);
  });
});

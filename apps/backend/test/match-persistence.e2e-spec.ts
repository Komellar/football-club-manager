import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import {
  User,
  Player,
  Contract,
  Transfer,
  PlayerStatistics,
} from '../src/shared/entities';
import { Fixture } from '../src/shared/entities/fixture.entity';
import { FixturesService } from '../src/modules/match-events/services/fixtures.service';
import { LineupService } from '../src/modules/match-events/services/lineup.service';
import { StadiumService } from '../src/modules/stadium/stadium.service';
import { MatchStatisticsProcessorService } from '../src/modules/statistics/services/match-statistics-processor.service';
import { LinkMatchPlayerStatistics1790899200000 } from '../src/database/migrations/1790899200000-LinkMatchPlayerStatistics';
import { matchState } from '../src/modules/match-events/__tests__/match-test-data';
import { AddFixtureSimulationSettings1790899201000 } from '../src/database/migrations/1790899201000-AddFixtureSimulationSettings';
import { ContractsService } from '../src/modules/contracts/services/contracts.service';
import { ContractFinancialService } from '../src/modules/contracts/services/contractFinancial.service';
import { TransfersService } from '../src/modules/transfers/services/transfers.service';
import { PlayerStatisticsService } from '../src/modules/statistics/services/player-statistics.service';
import {
  ContractStatus,
  ContractType,
  TransferDirection,
  TransferStatus,
  TransferType,
} from '@repo/core';

// Use a disposable PostgreSQL database. All test objects live in a private schema.
const databaseTests = process.env.TEST_DATABASE_URL ? describe : describe.skip;
databaseTests('Atomic PostgreSQL match completion', () => {
  const schema = `match_test_${randomUUID().replace(/-/g, '')}`;
  const database = new DataSource({
    type: 'postgres',
    url: process.env.TEST_DATABASE_URL,
    schema,
    entities: [User, Player, Contract, Transfer, PlayerStatistics, Fixture],
    synchronize: false,
  });
  let service: FixturesService;

  beforeAll(async () => {
    await database.initialize();
    await database.query(`CREATE SCHEMA "${schema}"`);
    await database.query(
      `CREATE TABLE "${schema}".players (
        id int PRIMARY KEY, name varchar(100) NOT NULL DEFAULT 'Test Player', position varchar NOT NULL DEFAULT 'forward',
        date_of_birth date NOT NULL DEFAULT '2000-01-01', country varchar(50) NOT NULL DEFAULT 'ESP',
        height int, weight numeric(5,2), jersey_number int, market_value numeric(12,2),
        is_active boolean NOT NULL DEFAULT true, image_url varchar(255),
        created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now()
      )`,
    );
    await database.query(
      `INSERT INTO "${schema}".players (id) SELECT generate_series(1, 11)`,
    );
    await database.query(`CREATE TABLE "${schema}".fixtures (
      id uuid PRIMARY KEY, opponent_name varchar(100) NOT NULL, competition varchar(100) NOT NULL,
      kickoff_at timestamptz NOT NULL, status varchar(20) NOT NULL, lineup jsonb NOT NULL,
      result jsonb, completed_at timestamptz, ticket_price numeric(12,2), matchday jsonb,
      created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now()
    )`);
    await database.query(`CREATE TABLE "${schema}".player_statistics (
      id serial PRIMARY KEY, player_id int NOT NULL REFERENCES "${schema}".players(id),
      season varchar(9) NOT NULL, minutes_played int NOT NULL DEFAULT 0,
      goals int NOT NULL DEFAULT 0, assists int NOT NULL DEFAULT 0,
      yellow_cards int NOT NULL DEFAULT 0, red_cards int NOT NULL DEFAULT 0,
      saves_made int NOT NULL DEFAULT 0, goals_conceded int NOT NULL DEFAULT 0,
      shots_on_target int NOT NULL DEFAULT 0, shots_off_target int NOT NULL DEFAULT 0,
      fouls int NOT NULL DEFAULT 0, rating numeric(3,1),
      created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now()
    )`);
    await database.query(`CREATE TABLE "${schema}".contracts (
      id serial PRIMARY KEY, player_id int NOT NULL REFERENCES "${schema}".players(id),
      contract_type varchar NOT NULL, status varchar NOT NULL, start_date date NOT NULL, end_date date NOT NULL,
      salary numeric(12,2) NOT NULL, bonuses numeric(12,2), sign_on_fee numeric(12,2), agent_fee numeric(12,2),
      release_clause numeric(12,2), notes text, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now()
    )`);
    await database.query(`CREATE TABLE "${schema}".transfers (
      id serial PRIMARY KEY, player_id int NOT NULL REFERENCES "${schema}".players(id),
      other_club_name varchar(100), transfer_direction varchar NOT NULL, transfer_type varchar NOT NULL,
      transfer_status varchar NOT NULL, transfer_date date NOT NULL, transfer_fee numeric(12,2),
      agent_fee numeric(10,2), loan_end_date date, notes text, created_by varchar(100),
      created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now()
    )`);
    const runner = database.createQueryRunner();
    await runner.connect();
    try {
      await runner.query(`SET search_path TO "${schema}"`);
      await new LinkMatchPlayerStatistics1790899200000().up(runner);
      await new AddFixtureSimulationSettings1790899201000().up(runner);
    } finally {
      await runner.release();
    }
    service = new FixturesService(
      database.getRepository(Fixture),
      {} as LineupService,
      {} as StadiumService,
      new MatchStatisticsProcessorService(),
    );
  });

  afterAll(async () => {
    if (database.isInitialized) {
      try {
        await database.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      } finally {
        await database.destroy();
      }
    }
  });

  beforeEach(async () => {
    await database.query(
      `TRUNCATE "${schema}".fixtures, "${schema}".player_statistics, "${schema}".contracts, "${schema}".transfers RESTART IDENTITY`,
    );
    const state = matchState();
    await database.getRepository(Fixture).save({
      id: state.fixtureId,
      opponentName: 'Away',
      competition: 'Friendly',
      kickoffAt: state.startTime,
      status: 'in_progress',
      lineup: state.homeTeam.players,
      result: null,
      completedAt: null,
      ticketPrice: null,
      matchday: null,
    });
  });

  it('commits the result and eleven rows once under concurrent completion', async () => {
    const state = matchState();
    await Promise.all([
      service.complete(state.fixtureId!, state),
      service.complete(state.fixtureId!, state),
    ]);
    const fixture = await database
      .getRepository(Fixture)
      .findOneByOrFail({ id: state.fixtureId });
    expect(fixture.status).toBe('completed');
    expect(fixture.result?.matchId).toBe(state.matchId);
    expect(
      await database
        .getRepository(PlayerStatistics)
        .countBy({ matchId: state.matchId }),
    ).toBe(11);
    await expect(
      database.getRepository(PlayerStatistics).save({
        matchId: state.matchId,
        playerId: 1,
        season: '2025-2026',
      }),
    ).rejects.toThrow();
  });

  it('rolls back every player row if saving the fixture result fails, then retries', async () => {
    const state = matchState();
    await database.query(`ALTER TABLE "${schema}".fixtures
      ADD CONSTRAINT reject_test_result CHECK (result IS NULL)`);
    try {
      await expect(service.complete(state.fixtureId!, state)).rejects.toThrow();
      const fixture = await database
        .getRepository(Fixture)
        .findOneByOrFail({ id: state.fixtureId });
      expect(fixture.status).toBe('in_progress');
      expect(fixture.result).toBeNull();
      expect(await database.getRepository(PlayerStatistics).count()).toBe(0);
    } finally {
      await database.query(
        `ALTER TABLE "${schema}".fixtures DROP CONSTRAINT reject_test_result`,
      );
    }
    await service.complete(state.fixtureId!, state);
    expect(await database.getRepository(PlayerStatistics).count()).toBe(11);
  });

  it('rolls back completion if a player-statistics foreign key fails', async () => {
    const state = matchState();
    state.homeTeam.players[10].id = 9999;
    await expect(service.complete(state.fixtureId!, state)).rejects.toThrow();
    const fixture = await database
      .getRepository(Fixture)
      .findOneByOrFail({ id: state.fixtureId });
    expect(fixture.status).toBe('in_progress');
    expect(fixture.result).toBeNull();
    expect(await database.getRepository(PlayerStatistics).count()).toBe(0);
  });

  it('hydrates DATE columns and permits a salary-only contract update without losing signing fees', async () => {
    const repository = database.getRepository(Contract);
    const contracts = new ContractsService(repository);
    const created = await contracts.create({
      playerId: 1,
      contractType: ContractType.PERMANENT,
      status: ContractStatus.ACTIVE,
      startDate: new Date('2026-10-20'),
      endDate: new Date('2027-10-20'),
      salary: 1000,
      signOnFee: 200,
      agentFee: 100,
    });
    const saved = await contracts.update(created.id, { salary: 2000 });
    expect(saved.playerId).toBe(1);
    expect(saved.startDate).toEqual(new Date('2026-10-20'));
    expect(
      await new ContractFinancialService(repository).calculateTotalWages(
        new Date('2026-10-01'),
        new Date('2026-10-31T23:59:59Z'),
      ),
    ).toEqual({ totalWages: 2000, totalSignOnFees: 200, totalAgentFees: 100 });
    await expect(
      contracts.update(created.id, { endDate: new Date('2026-01-01') }),
    ).rejects.toThrow();
    expect(
      (await repository.findOneByOrFail({ id: created.id })).endDate,
    ).toEqual(new Date('2027-10-20'));
  });

  it('allows a completed signing followed by a sale and a notes-only edit', async () => {
    const transfers = new TransfersService(
      database.getRepository(Transfer),
      database.getRepository(Player),
    );
    await transfers.create({
      playerId: 1,
      transferType: TransferType.SIGNING,
      transferDirection: TransferDirection.INCOMING,
      transferStatus: TransferStatus.COMPLETED,
      transferDate: new Date('2026-01-01'),
      otherClubName: 'Other Club',
    });
    const sale = await transfers.create({
      playerId: 1,
      transferType: TransferType.SALE,
      transferDirection: TransferDirection.OUTGOING,
      transferStatus: TransferStatus.COMPLETED,
      transferDate: new Date('2026-07-01'),
      otherClubName: 'Other Club',
    });
    expect(
      (await transfers.update(sale.id, { notes: 'Corrected note' })).notes,
    ).toBe('Corrected note');
    expect((await transfers.findByPlayer(1)).currentClub).toBe('Other Club');
  });

  it('serializes competing completed incoming transfers with the player row lock', async () => {
    const transfers = new TransfersService(
      database.getRepository(Transfer),
      database.getRepository(Player),
    );
    const movement = {
      playerId: 1,
      transferType: TransferType.SIGNING,
      transferDirection: TransferDirection.INCOMING,
      transferStatus: TransferStatus.COMPLETED,
      transferDate: new Date('2026-01-01'),
      otherClubName: 'Other Club',
    };
    const results = await Promise.allSettled([
      transfers.create(movement),
      transfers.create(movement),
    ]);
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(await database.getRepository(Transfer).count()).toBe(1);
  });

  it('aggregates every match beyond the default list page and excludes unrated rows from the mean', async () => {
    const statistics = database.getRepository(PlayerStatistics);
    await statistics.save(
      Array.from({ length: 17 }, (_, index) => ({
        playerId: 1,
        season: index < 12 ? '2024-2025' : '2025-2026',
        minutesPlayed: 90,
        goals: 1,
        assists: 1,
        rating: index < 12 ? 6 : index < 16 ? 9 : undefined,
      })),
    );
    await statistics.save({ playerId: 2, season: '2025-2026', goals: 99 });
    const summary = await new PlayerStatisticsService(
      statistics,
    ).getPlayerSummary(1);
    expect(summary.totals).toMatchObject({
      appearances: 17,
      minutesPlayed: 1530,
      goals: 17,
      assists: 17,
      rating: 6.75,
    });
    expect(summary.seasons.map((season) => season.appearances)).toEqual([
      12, 5,
    ]);
    expect(summary.seasons.map((season) => season.rating)).toEqual([6, 9]);
  });
});

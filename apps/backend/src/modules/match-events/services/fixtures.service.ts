import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CreateFixtureDto,
  FixtureDto,
  MatchSimulationState,
  UpdateFixtureDto,
  MatchHistoryQuery,
  MatchHistoryPage,
  MatchHistoryItem,
  simulateMatchday,
} from '@repo/core';
import { Fixture } from '@/shared/entities/fixture.entity';
import { LineupService } from './lineup.service';
import { StadiumService } from '../../stadium/stadium.service';

const editable = ['scheduled', 'interrupted'];

@Injectable()
export class FixturesService implements OnModuleInit {
  constructor(
    @InjectRepository(Fixture) private readonly fixtures: Repository<Fixture>,
    private readonly lineups: LineupService,
    private readonly stadium: StadiumService,
  ) {}

  async onModuleInit() {
    // The simulator runs in one process. A restart cannot resume its old timer.
    await this.fixtures.update(
      { status: 'in_progress' },
      { status: 'interrupted' },
    );
  }

  async list(): Promise<FixtureDto[]> {
    return (
      await this.fixtures.find({
        where: {
          status: In(['scheduled', 'interrupted', 'in_progress', 'cancelled']),
        },
        order: { kickoffAt: 'ASC', id: 'ASC' },
      })
    ).map((f) => this.view(f));
  }

  async find(id: string): Promise<FixtureDto> {
    return this.view(await this.fixtures.findOneByOrFail({ id }));
  }

  async report(id: string): Promise<FixtureDto> {
    const fixture = await this.fixtures.findOneByOrFail({
      id,
      status: 'completed',
    });
    if (!fixture.result)
      throw new NotFoundException('No completed match report is available');
    return this.view(fixture);
  }

  async history(query: MatchHistoryQuery): Promise<MatchHistoryPage> {
    const builder = this.fixtures
      .createQueryBuilder('f')
      .where('f.status = :status', { status: 'completed' })
      .andWhere('f.result IS NOT NULL');
    if (query.search)
      builder.andWhere('f.opponentName ILIKE :search', {
        search: `%${query.search.replace(/[\\%_]/g, '\\$&')}%`,
      });
    if (query.outcome) {
      const operator = { win: '>', draw: '=', loss: '<' }[query.outcome];
      builder.andWhere(
        `(f.result->'score'->>'home')::int ${operator} (f.result->'score'->>'away')::int`,
      );
    }
    const total = await builder.getCount();
    const rows = await builder
      .select('f.id', 'id')
      .addSelect('f.opponentName', 'opponentName')
      .addSelect('f.competition', 'competition')
      .addSelect('f.kickoffAt', 'kickoffAt')
      .addSelect('f.completedAt', 'completedAt')
      .addSelect("f.result->'score'", 'score')
      .orderBy('f.completedAt', 'DESC')
      .addOrderBy('f.id', 'DESC')
      .offset((query.page - 1) * query.limit)
      .limit(query.limit)
      .getRawMany<MatchHistoryItem>();
    return {
      data: rows,
      total,
      page: query.page,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async create(data: CreateFixtureDto): Promise<FixtureDto> {
    return this.view(
      await this.fixtures.save(
        this.fixtures.create({
          ...data,
          kickoffAt: new Date(data.kickoffAt),
          status: 'scheduled',
          lineup: [],
          result: null,
          completedAt: null,
          ticketPrice: data.ticketPrice ?? null,
          matchday: null,
        }),
      ),
    );
  }

  async update(id: string, data: UpdateFixtureDto): Promise<FixtureDto> {
    await this.fixtures.findOneByOrFail({ id });
    const { lineupIds, kickoffAt, ...fields } = data;
    const lineup =
      lineupIds === undefined
        ? undefined
        : lineupIds.length
          ? await this.lineups.resolve(lineupIds)
          : [];
    const update = await this.fixtures.update(
      { id, status: In(editable) },
      {
        ...fields,
        ...(kickoffAt ? { kickoffAt: new Date(kickoffAt) } : {}),
        ...(lineup ? { lineup } : {}),
      },
    );
    if (!update.affected)
      throw new ConflictException(
        'Only scheduled or interrupted fixtures can be changed',
      );
    return this.find(id);
  }

  async cancel(id: string): Promise<FixtureDto> {
    await this.fixtures.findOneByOrFail({ id });
    const result = await this.fixtures.update(
      { id, status: In(editable) },
      { status: 'cancelled' },
    );
    if (!result.affected)
      throw new ConflictException('This fixture cannot be cancelled');
    return this.find(id);
  }

  async claim(id: string): Promise<Fixture> {
    return this.fixtures.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Fixture);
      const fixture = await repo.findOneOrFail({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!editable.includes(fixture.status))
        throw new ConflictException('This fixture cannot be started');
      fixture.lineup = await this.lineups.resolve(
        fixture.lineup.map((p) => p.id),
      );
      fixture.status = 'in_progress';
      const stadium = await this.stadium.get();
      fixture.matchday = stadium
        ? simulateMatchday(
            stadium,
            fixture.ticketPrice ?? stadium.defaultTicketPrice,
          )
        : null;
      return repo.save(fixture);
    });
  }

  async interrupt(id: string) {
    await this.fixtures.update(
      { id, status: 'in_progress' },
      { status: 'interrupted' },
    );
  }

  async complete(id: string, state: MatchSimulationState): Promise<void> {
    const updated = await this.fixtures.update(
      { id, status: 'in_progress' },
      { status: 'completed', result: state, completedAt: new Date() },
    );
    if (!updated.affected) {
      const saved = await this.fixtures.findOneByOrFail({ id });
      if (
        saved.status === 'completed' &&
        saved.result?.matchId === state.matchId
      )
        return;
      throw new ConflictException('Fixture is no longer in progress');
    }
  }

  private view(f: Fixture): FixtureDto {
    return {
      id: f.id,
      opponentName: f.opponentName,
      competition: f.competition,
      kickoffAt: f.kickoffAt.toISOString(),
      status: f.status,
      lineup: f.lineup,
      result: f.result,
      completedAt: f.completedAt?.toISOString() ?? null,
      ticketPrice: f.ticketPrice ?? null,
      matchday: f.matchday ?? null,
    };
  }
}

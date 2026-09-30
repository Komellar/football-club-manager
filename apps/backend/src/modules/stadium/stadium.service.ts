import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { StadiumSettings } from '@repo/core';
import { Stadium } from '@/shared/entities/stadium.entity';
import { StadiumMaintenanceRate } from '@/shared/entities/stadium-maintenance-rate.entity';

@Injectable()
export class StadiumService {
  constructor(
    @InjectRepository(Stadium) private readonly stadium: Repository<Stadium>,
  ) {}
  async get(): Promise<StadiumSettings | null> {
    const row = await this.stadium.findOneBy({ id: 1 });
    return row ? this.view(row) : null;
  }
  async save(settings: StadiumSettings): Promise<StadiumSettings> {
    await this.stadium.manager.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(1790812801)');
      await manager
        .getRepository(Stadium)
        .upsert({ ...settings, id: 1 }, ['id']);
      await manager
        .getRepository(StadiumMaintenanceRate)
        .upsert(
          {
            effectiveFrom: new Date().toISOString().slice(0, 10),
            monthlyAmount: settings.monthlyMaintenance,
          },
          ['effectiveFrom'],
        );
    });
    return settings;
  }
  private view({ id, updatedAt, ...settings }: Stadium): StadiumSettings {
    return settings;
  }
}

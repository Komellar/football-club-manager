import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { StadiumSettings } from '@repo/core';
import { Stadium } from '@/shared/entities/stadium.entity';

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
    await this.stadium.upsert({ ...settings, id: 1 }, ['id']);
    return settings;
  }
  private view({ id, updatedAt, ...settings }: Stadium): StadiumSettings {
    return settings;
  }
}

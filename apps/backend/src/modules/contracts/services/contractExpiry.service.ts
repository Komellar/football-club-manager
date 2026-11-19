import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractStatus, SortOrder } from '@repo/core';
import { Contract } from '@/shared/entities';

const EXPIRY_SWEEP_INTERVAL_MS = 60 * 60 * 1000;

@Injectable()
export class ContractExpiryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ContractExpiryService.name);
  private sweepTimer: ReturnType<typeof setInterval> | undefined;

  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.sweep();
    this.sweepTimer = setInterval(
      () => void this.sweep(),
      EXPIRY_SWEEP_INTERVAL_MS,
    );
    this.sweepTimer.unref();
  }

  onModuleDestroy(): void {
    clearInterval(this.sweepTimer);
  }

  /** Moves active contracts whose end date has passed to EXPIRED. */
  async expireEndedContracts(): Promise<number> {
    const result = await this.contractRepository
      .createQueryBuilder()
      .update(Contract)
      .set({ status: ContractStatus.EXPIRED })
      .where('status = :active', { active: ContractStatus.ACTIVE })
      .andWhere('end_date < CURRENT_DATE')
      .execute();
    return result.affected ?? 0;
  }

  private async sweep(): Promise<void> {
    try {
      const expired = await this.expireEndedContracts();
      if (expired) this.logger.log(`Marked ${expired} contract(s) as expired`);
    } catch (error) {
      this.logger.error('Contract expiry sweep failed', error);
    }
  }

  async findExpiringContracts(days: number): Promise<Contract[]> {
    const futureDate = new Date();
    futureDate.setUTCDate(futureDate.getUTCDate() + days);

    return await this.contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.player', 'player')
      .where('contract.status = :status', { status: ContractStatus.ACTIVE })
      .andWhere('contract.endDate BETWEEN :currentDate AND :futureDate', {
        currentDate: new Date(),
        futureDate,
      })
      .orderBy('contract.endDate', SortOrder.ASC)
      .getMany();
  }

  async getRecentlyExpiredContracts(days: number): Promise<Contract[]> {
    const pastDate = new Date();
    pastDate.setUTCDate(pastDate.getUTCDate() - days);

    return await this.contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.player', 'player')
      .where('contract.status = :status', {
        status: ContractStatus.EXPIRED,
      })
      .andWhere('contract.endDate BETWEEN :pastDate AND :currentDate', {
        pastDate,
        currentDate: new Date(),
      })
      .orderBy('contract.endDate', SortOrder.DESC)
      .getMany();
  }
}

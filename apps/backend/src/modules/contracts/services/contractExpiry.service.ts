import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractStatus, SortOrder } from '@repo/core';
import { Contract } from '@/shared/entities';

@Injectable()
export class ContractExpiryService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
  ) {}

  async findExpiringContracts(days: number): Promise<Contract[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

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
    pastDate.setDate(pastDate.getDate() - days);

    return await this.contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.player', 'player')
      .where('contract.status = :status', {
        status: ContractStatus.TERMINATED,
      })
      .andWhere('contract.endDate BETWEEN :pastDate AND :currentDate', {
        pastDate,
        currentDate: new Date(),
      })
      .orderBy('contract.endDate', SortOrder.DESC)
      .getMany();
  }
}

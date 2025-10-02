import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractStatus } from '@repo/core';
import { Contract } from '@/shared/entities';

@Injectable()
export class ContractExpiryService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
  ) {}

  async findExpiringContracts(days: number): Promise<Contract[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const contracts = await this.contractRepository
        .createQueryBuilder('contract')
        .leftJoinAndSelect('contract.player', 'player')
        .where('contract.status = :status', { status: ContractStatus.ACTIVE })
        .andWhere('contract.endDate BETWEEN :currentDate AND :futureDate', {
          currentDate: new Date(),
          futureDate,
        })
        .orderBy('contract.endDate', 'ASC')
        .getMany();

      return contracts;
    } catch {
      throw new InternalServerErrorException(
        'Failed to fetch expiring contracts',
      );
    }
  }

  async getRecentlyExpiredContracts(days: number): Promise<Contract[]> {
    try {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - days);

      const contracts = await this.contractRepository
        .createQueryBuilder('contract')
        .leftJoinAndSelect('contract.player', 'player')
        .where('contract.status = :status', {
          status: ContractStatus.TERMINATED,
        })
        .andWhere('contract.endDate BETWEEN :pastDate AND :currentDate', {
          pastDate,
          currentDate: new Date(),
        })
        .orderBy('contract.endDate', 'DESC')
        .getMany();

      return contracts;
    } catch {
      throw new InternalServerErrorException(
        'Failed to fetch recently expired contracts',
      );
    }
  }
}

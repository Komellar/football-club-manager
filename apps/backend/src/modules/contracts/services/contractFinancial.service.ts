import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ContractStatus,
  ContractType,
  type ContractValueCalculation,
  type ContractFinancialSummary,
} from '@repo/core';
import { Contract } from '@/shared/entities';

@Injectable()
export class ContractFinancialService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
  ) {}

  async calculateContractValue(
    contractId: number,
  ): Promise<ContractValueCalculation> {
    try {
      const contract = await this.findOne(contractId);
      const { totalMonths, remainingMonths } =
        this.calculateRemainingMonths(contract);

      const components = {
        salaryValue: contract.salary * totalMonths,
        bonusesValue: contract.bonuses || 0,
        signOnFeeValue: contract.signOnFee || 0,
        agentFeeValue: contract.agentFee || 0,
      };

      const totalValue = Object.values(components).reduce(
        (sum, value) => sum + value,
        0,
      );

      const remainingValue = this.calculateRemainingValue(
        contract,
        remainingMonths,
        totalMonths,
      );

      return {
        totalValue,
        ...components,
        remainingValue,
        remainingMonths,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to calculate contract value for ID ${contractId}`,
      );
    }
  }

  async getFinancialSummary(): Promise<ContractFinancialSummary> {
    try {
      const [activeContracts, upcomingExpiries] = await Promise.all([
        this.getActiveContracts(),
        this.findExpiringContracts(90),
      ]);

      const contractMetrics = this.calculateContractMetrics(activeContracts);
      const upcomingExpiryMetrics =
        this.calculateExpiryMetrics(upcomingExpiries);

      return {
        ...contractMetrics,
        upcomingExpiries: upcomingExpiryMetrics,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to generate financial summary',
      );
    }
  }

  private async findOne(id: number): Promise<Contract> {
    try {
      const contract = await this.contractRepository
        .createQueryBuilder('contract')
        .leftJoinAndSelect('contract.player', 'player')
        .where('contract.id = :id', { id })
        .getOne();

      if (!contract) {
        throw new NotFoundException(`Contract with ID ${id} not found`);
      }

      return contract;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to fetch contract with ID ${id}`,
      );
    }
  }

  private async getActiveContracts(): Promise<Contract[]> {
    return await this.contractRepository
      .createQueryBuilder('contract')
      .where('contract.status = :status', { status: ContractStatus.ACTIVE })
      .getMany();
  }

  private async findExpiringContracts(days: number): Promise<Contract[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await this.contractRepository
      .createQueryBuilder('contract')
      .where('contract.status = :status', { status: ContractStatus.ACTIVE })
      .andWhere('contract.endDate BETWEEN :currentDate AND :futureDate', {
        currentDate: new Date(),
        futureDate,
      })
      .getMany();
  }

  private calculateContractMetrics(
    contracts: Contract[],
  ): Omit<ContractFinancialSummary, 'upcomingExpiries'> {
    const contractsByType: Record<ContractType, number> = {
      [ContractType.PERMANENT]: 0,
      [ContractType.LOAN]: 0,
      [ContractType.TRIAL]: 0,
      [ContractType.YOUTH]: 0,
      [ContractType.PROFESSIONAL]: 0,
    };

    const metrics = contracts.reduce(
      (acc, contract) => {
        const { remainingMonths, totalMonths } =
          this.calculateRemainingMonths(contract);

        const remainingValue = this.calculateRemainingValue(
          contract,
          remainingMonths,
          totalMonths,
        );

        contractsByType[contract.contractType]++;

        return {
          totalActiveValue: acc.totalActiveValue + remainingValue,
          totalMonthlyCommitment: acc.totalMonthlyCommitment + contract.salary,
        };
      },
      { totalActiveValue: 0, totalMonthlyCommitment: 0 },
    );

    const averageSalary =
      contracts.length > 0
        ? metrics.totalMonthlyCommitment / contracts.length
        : 0;

    return {
      ...metrics,
      averageSalary,
      totalContracts: contracts.length,
      contractsByType,
    };
  }

  private calculateExpiryMetrics(contracts: Contract[]): {
    count: number;
    value: number;
  } {
    const value = contracts.reduce((sum, contract) => {
      const { remainingMonths, totalMonths } =
        this.calculateRemainingMonths(contract);

      const remainingValue = this.calculateRemainingValue(
        contract,
        remainingMonths,
        totalMonths,
      );

      return sum + remainingValue;
    }, 0);

    return {
      count: contracts.length,
      value,
    };
  }

  private calculateRemainingValue(
    contract: Contract,
    remainingMonths: number,
    totalMonths: number,
  ): number {
    const contractBonuses = contract.bonuses || 0;

    const remainingSalaryValue = contract.salary * remainingMonths;
    const remainingBonusValue =
      totalMonths > 0 ? (contractBonuses * remainingMonths) / totalMonths : 0;

    return remainingSalaryValue + remainingBonusValue;
  }

  private calculateRemainingMonths(
    contract: Contract,
    currentDate: Date = new Date(),
  ): { totalMonths: number; remainingMonths: number } {
    const totalMonths = this.calculateMonthsDifference(
      contract.startDate,
      contract.endDate,
    );

    const remainingMonths = Math.max(
      0,
      currentDate > contract.startDate
        ? this.calculateMonthsDifference(currentDate, contract.endDate)
        : totalMonths,
    );

    return { totalMonths, remainingMonths };
  }

  private calculateMonthsDifference(startDate: Date, endDate: Date): number {
    if (endDate <= startDate) return 0;

    const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthsDiff = endDate.getMonth() - startDate.getMonth();
    const baseMonths = yearsDiff * 12 + monthsDiff;

    // If there are any days beyond the start day, count as an additional month
    if (endDate.getDate() > startDate.getDate()) {
      return baseMonths + 1;
    }

    // If same day or end day is earlier, but we have some duration, count at least 1 month
    return Math.max(1, baseMonths);
  }
}

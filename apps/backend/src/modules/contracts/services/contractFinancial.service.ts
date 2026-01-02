import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
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

  async calculateContractValue(id: number): Promise<ContractValueCalculation> {
    const contract = await this.findOne(id);
    const currentDate = new Date();
    const { totalMonths, remainingMonths } = this.calculateRemainingMonths(
      contract,
      currentDate,
    );

    const salaryValue = contract.salary * totalMonths;
    const bonusesValue = contract.bonuses || 0;
    const signOnFeeValue = contract.signOnFee || 0;
    const agentFeeValue = contract.agentFee || 0;
    const totalValue =
      salaryValue + bonusesValue + signOnFeeValue + agentFeeValue;

    const remainingValue = this.calculateRemainingValue(
      contract,
      remainingMonths,
      totalMonths,
    );

    return {
      totalValue,
      salaryValue,
      bonusesValue,
      signOnFeeValue,
      agentFeeValue,
      remainingValue,
      remainingMonths,
    };
  }

  async getFinancialSummary(): Promise<ContractFinancialSummary> {
    const [activeContracts, upcomingExpiries] = await Promise.all([
      this.getActiveContracts(),
      this.findExpiringContracts(365),
    ]);

    const contractMetrics = this.calculateContractMetrics(activeContracts);
    const upcomingExpiryMetrics = this.calculateExpiryMetrics(upcomingExpiries);

    return {
      ...contractMetrics,
      upcomingExpiries: upcomingExpiryMetrics,
    };
  }

  private async findOne(id: number): Promise<Contract> {
    return await this.contractRepository.findOneOrFail({
      where: { id },
      relations: ['player'],
    });
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
      [ContractType.YOUTH]: 0,
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
    const start = new Date(contract.startDate);
    const end = new Date(contract.endDate);
    const totalMonths = this.calculateMonthsDifference(start, end);

    if (currentDate >= end) {
      return { totalMonths, remainingMonths: 0 };
    }

    const remainingMonths = Math.max(
      0,
      currentDate > start
        ? this.calculateMonthsDifference(currentDate, end)
        : totalMonths,
    );

    return { totalMonths, remainingMonths };
  }

  private calculateMonthsDifference(
    startDate: Date | string,
    endDate: Date | string,
  ): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) return 0;

    const yearsDiff = end.getFullYear() - start.getFullYear();
    const monthsDiff = end.getMonth() - start.getMonth();
    const baseMonths = yearsDiff * 12 + monthsDiff;

    // If there are any days beyond the start day, count as an additional month
    if (end.getDate() > start.getDate()) {
      return baseMonths + 1;
    }

    // If same day or end day is earlier, but we have some duration, count at least 1 month
    return Math.max(1, baseMonths);
  }

  async calculateTotalWages(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalWages: number;
    totalSignOnFees: number;
    totalAgentFees: number;
  }> {
    const contracts = await this.contractRepository.find({
      where: {
        startDate: LessThanOrEqual(endDate),
        endDate: MoreThanOrEqual(startDate),
      },
    });

    let totalWages = 0;
    let totalSignOnFees = 0;
    let totalContractAgentFees = 0;

    for (const contract of contracts) {
      const overlapStart =
        contract.startDate > startDate ? contract.startDate : startDate;
      const overlapEnd =
        contract.endDate < endDate ? contract.endDate : endDate;

      if (overlapStart <= overlapEnd) {
        const months =
          (overlapEnd.getFullYear() - overlapStart.getFullYear()) * 12 +
          (overlapEnd.getMonth() - overlapStart.getMonth()) +
          (overlapEnd.getDate() - overlapStart.getDate() >= 0 ? 1 : 0);

        const duration = Math.max(0, months);
        totalWages += contract.salary * duration;
      }

      if (contract.startDate >= startDate && contract.startDate <= endDate) {
        totalSignOnFees += Number(contract.signOnFee || 0);
        totalContractAgentFees += Number(contract.agentFee || 0);
      }
    }

    return {
      totalWages,
      totalSignOnFees,
      totalAgentFees: totalContractAgentFees,
    };
  }
}

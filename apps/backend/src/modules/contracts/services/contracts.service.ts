import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '@/shared/entities/contract.entity';
import {
  ContractStatus,
  CreateContractDto,
  UpdateContractDto,
  ContractListDto,
  PaginatedContractListResponseDto,
  ContractResponseDto,
  FilterMode,
  type FilterOptions,
  CreateContractSchema,
} from '@repo/core';
import { ListQueryBuilder } from '@/shared/query/list-query-builder';

/** Today as a UTC calendar date, matching how DATE columns are read. */
export function todayUtc(now = new Date()): Date {
  return new Date(now.toISOString().slice(0, 10));
}

/**
 * Stamps the termination date when a contract becomes terminated and clears
 * it if the contract is reinstated.
 */
function syncTerminationDate(
  contract: Contract,
  previousStatus: ContractStatus | undefined,
): void {
  if (contract.status !== ContractStatus.TERMINATED) {
    contract.terminatedAt = null;
  } else if (previousStatus !== ContractStatus.TERMINATED) {
    const today = todayUtc();
    contract.terminatedAt =
      today < contract.endDate ? today : new Date(contract.endDate);
  }
}

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
  ) {}

  async create(createContractDto: CreateContractDto): Promise<Contract> {
    const parsed = CreateContractSchema.safeParse(createContractDto);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues);
    const contract = this.contractRepository.create(parsed.data);
    syncTerminationDate(contract, undefined);
    return await this.contractRepository.save(contract);
  }

  async findAll(
    queryDto?: Partial<ContractListDto>,
  ): Promise<PaginatedContractListResponseDto> {
    const filterOptions: FilterOptions = {
      defaultFilterMode: FilterMode.EXACT,
      filterModes: {
        minSalary: FilterMode.GTE,
        maxSalary: FilterMode.LTE,
      },
      searchOptions: {
        searchFields: ['player.name'],
        searchMode: FilterMode.PARTIAL,
      },
    };

    const result = await ListQueryBuilder.executeQuery(
      this.contractRepository,
      queryDto,
      filterOptions,
      ['player'],
    );

    return {
      data: result.data.map((contract) => this.mapToResponseDto(contract)),
      pagination: result.pagination,
    };
  }

  async findOne(id: number): Promise<Contract> {
    return await this.contractRepository.findOneOrFail({
      where: { id },
      relations: ['player'],
    });
  }

  async update(
    id: number,
    updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    await this.contractRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(Contract);
      const contract = await repository.findOneOrFail({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (
        updateContractDto.playerId !== undefined &&
        updateContractDto.playerId !== contract.playerId
      ) {
        throw new BadRequestException(
          'Cannot change the player associated with the contract',
        );
      }
      const fields = Object.fromEntries(
        Object.entries(updateContractDto).filter(
          ([, value]) => value !== undefined,
        ),
      );
      const parsed = CreateContractSchema.safeParse({ ...contract, ...fields });
      if (!parsed.success) throw new BadRequestException(parsed.error.issues);
      const previousStatus = contract.status;
      Object.assign(contract, parsed.data);
      syncTerminationDate(contract, previousStatus);
      await repository.save(contract);
    });
    return await this.contractRepository.findOneOrFail({
      where: { id },
      relations: ['player'],
    });
  }

  async remove(id: number): Promise<void> {
    const contract = await this.contractRepository.findOneOrFail({
      where: { id },
      relations: ['player'],
    });

    await this.contractRepository.remove(contract);
  }

  private mapToResponseDto(contract: Contract): ContractResponseDto {
    return {
      id: contract.id,
      playerId: contract.playerId,
      contractType: contract.contractType,
      status: contract.status,
      startDate: contract.startDate,
      endDate: contract.endDate,
      salary: contract.salary,
      bonuses: contract.bonuses,
      signOnFee: contract.signOnFee,
      releaseClause: contract.releaseClause,
      agentFee: contract.agentFee,
      notes: contract.notes,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      player: contract.player,
    };
  }
}

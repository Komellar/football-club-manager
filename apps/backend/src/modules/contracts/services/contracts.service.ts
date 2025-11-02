import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '@/shared/entities/contract.entity';
import {
  CreateContractDto,
  UpdateContractDto,
  ContractListDto,
  PaginatedContractListResponseDto,
  ContractResponseDto,
  FilterMode,
  type FilterOptions,
} from '@repo/core';
import { ListQueryBuilder } from '@/shared/query/list-query-builder';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
  ) {}

  async create(createContractDto: CreateContractDto): Promise<Contract> {
    const contract = this.contractRepository.create(createContractDto);
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
    const existingContract = await this.findOne(id);

    if (updateContractDto.playerId !== existingContract.playerId) {
      throw new NotFoundException(
        'Cannot change the player associated with the contract',
      );
    }

    const updatedContract = {
      ...updateContractDto,
      id,
    };

    await this.contractRepository.save(updatedContract);
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

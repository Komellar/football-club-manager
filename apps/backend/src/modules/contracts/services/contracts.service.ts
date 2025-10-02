import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
import { ListQueryBuilder } from '../../../shared/query/list-query-builder';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
  ) {}

  async create(createContractDto: CreateContractDto): Promise<Contract> {
    try {
      const contract = this.contractRepository.create(createContractDto);
      return await this.contractRepository.save(contract);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create contract: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findAll(
    queryDto?: Partial<ContractListDto>,
  ): Promise<PaginatedContractListResponseDto> {
    try {
      const filterOptions: FilterOptions = {
        defaultFilterMode: FilterMode.EXACT,
        filterModes: {
          minSalary: FilterMode.GTE,
          maxSalary: FilterMode.LTE,
        },
        searchOptions: {
          searchFields: ['notes'],
          searchMode: FilterMode.PARTIAL,
        },
      };

      const result = await ListQueryBuilder.executeQuery(
        this.contractRepository,
        queryDto,
        filterOptions,
      );

      return {
        data: result.data.map((contract) => this.mapToResponseDto(contract)),
        pagination: result.pagination,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch contracts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findOne(id: number): Promise<Contract> {
    try {
      const contract = await this.contractRepository.findOneOrFail({
        where: { id },
        relations: ['player'],
      });

      return contract;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch contract with id ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(
    id: number,
    updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    try {
      const existingContract = await this.findOne(id);

      if (updateContractDto.playerId !== existingContract.playerId) {
        throw new NotFoundException(
          'Cannot change the player associated with the contract',
        );
      }

      await this.contractRepository.save(updateContractDto);
      const updatedContract = await this.contractRepository.findOneOrFail({
        where: { id },
        relations: ['player'],
      });

      return updatedContract;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update contract with id ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const contract = await this.contractRepository.findOneOrFail({
        where: { id },
        relations: ['player'],
      });

      await this.contractRepository.remove(contract);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete contract with id ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
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
      currency: contract.currency,
      bonuses: contract.bonuses,
      signOnFee: contract.signOnFee,
      releaseClause: contract.releaseClause,
      agentFee: contract.agentFee,
      notes: contract.notes,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      player: contract.player
        ? {
            id: contract.player.id,
            name: contract.player.name,
            position: contract.player.position,
            jerseyNumber: contract.player.jerseyNumber,
          }
        : undefined,
    };
  }
}

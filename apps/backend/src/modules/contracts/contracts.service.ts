import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  ContractQuery,
  ContractStatus,
  CreateContractDto,
  UpdateContractDto,
  PaginatedContractResponseDto,
} from '@repo/core';
import { Contract } from '@/shared/entities';
import { PaginationHelper } from '../../shared/helpers/pagination.helper';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
  ) {}

  async create(createContractDto: CreateContractDto): Promise<Contract> {
    try {
      const existingActiveContract = await this.contractRepository.findOne({
        where: {
          playerId: createContractDto.playerId,
          status: ContractStatus.ACTIVE,
        },
      });

      if (existingActiveContract) {
        throw new BadRequestException(
          'Player already has an active contract. Please terminate the existing contract first.',
        );
      }

      const contract = this.contractRepository.create(createContractDto);
      const savedContract = await this.contractRepository.save(contract);

      return savedContract;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create contract');
    }
  }

  async findAll(query?: ContractQuery): Promise<PaginatedContractResponseDto> {
    try {
      const queryBuilder = this.contractRepository
        .createQueryBuilder('contract')
        .leftJoinAndSelect('contract.player', 'player');

      this.applyFilters(queryBuilder, query);
      this.applySorting(queryBuilder, query);

      const paginationOptions = {
        page: query?.page,
        limit: query?.limit,
      };

      const result = await PaginationHelper.paginate(
        queryBuilder,
        paginationOptions,
      );

      return result;
    } catch {
      throw new InternalServerErrorException('Failed to fetch contracts');
    }
  }

  async findOne(id: number): Promise<Contract> {
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

  async findByPlayerId(playerId: number): Promise<Contract[]> {
    try {
      const contracts = await this.contractRepository
        .createQueryBuilder('contract')
        .leftJoinAndSelect('contract.player', 'player')
        .where('contract.playerId = :playerId', { playerId })
        .orderBy('contract.createdAt', 'DESC')
        .getMany();

      return contracts;
    } catch {
      throw new InternalServerErrorException(
        `Failed to fetch contracts for player ${playerId}`,
      );
    }
  }

  async findActiveContracts(): Promise<Contract[]> {
    try {
      const contracts = await this.contractRepository
        .createQueryBuilder('contract')
        .leftJoinAndSelect('contract.player', 'player')
        .where('contract.status = :status', { status: ContractStatus.ACTIVE })
        .orderBy('contract.endDate', 'ASC')
        .getMany();

      return contracts;
    } catch {
      throw new InternalServerErrorException(
        'Failed to fetch active contracts',
      );
    }
  }

  async findExpiringContracts(days: number = 30): Promise<Contract[]> {
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

  async update(
    id: number,
    updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    try {
      const contract = await this.findOne(id);

      // Validate date relationship when dates are being updated
      if (updateContractDto.startDate || updateContractDto.endDate) {
        const startDate = updateContractDto.startDate
          ? new Date(updateContractDto.startDate)
          : contract.startDate;
        const endDate = updateContractDto.endDate
          ? new Date(updateContractDto.endDate)
          : contract.endDate;

        if (endDate <= startDate) {
          throw new BadRequestException('End date must be after start date');
        }
      }

      await this.contractRepository.update(id, updateContractDto);
      const updatedContract = await this.findOne(id);

      if (!updatedContract) {
        throw new InternalServerErrorException(
          'Failed to retrieve updated contract',
        );
      }

      return updatedContract;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to update contract with ID ${id}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const contract = await this.findOne(id);

      if (!contract) {
        throw new NotFoundException(`Contract with ID ${id} not found`);
      }
      if (contract.status === ContractStatus.ACTIVE) {
        throw new BadRequestException(
          'Cannot delete an active contract. Please terminate it first.',
        );
      }

      await this.contractRepository.remove(contract);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to remove contract with ID ${id}`,
      );
    }
  }

  async terminate(id: number, notes?: string): Promise<Contract> {
    try {
      const contract = await this.findOne(id);

      if (contract.status !== ContractStatus.ACTIVE) {
        throw new BadRequestException(
          'Only active contracts can be terminated',
        );
      }

      const updateData: Partial<Contract> = {
        status: ContractStatus.TERMINATED,
      };

      if (notes) {
        updateData.notes = contract.notes
          ? `${contract.notes}\n\nTermination: ${notes}`
          : `Termination: ${notes}`;
      }

      await this.contractRepository.update(id, updateData);
      const terminatedContract = await this.findOne(id);

      return terminatedContract;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to terminate contract with ID ${id}`,
      );
    }
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Contract>,
    query?: ContractQuery,
  ): void {
    if (query?.playerId) {
      queryBuilder.andWhere('contract.playerId = :playerId', {
        playerId: query.playerId,
      });
    }

    if (query?.status) {
      queryBuilder.andWhere('contract.status = :status', {
        status: query.status,
      });
    }

    if (query?.contractType) {
      queryBuilder.andWhere('contract.contractType = :contractType', {
        contractType: query.contractType,
      });
    }

    if (query?.startDate) {
      const startDate = new Date(query.startDate);
      const endDate = query.endDate ? new Date(query.endDate) : new Date();

      queryBuilder.andWhere(
        'contract.startDate BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Contract>,
    query?: ContractQuery,
  ): void {
    const sortBy = query?.sortBy || 'createdAt';
    const sortOrder = query?.sortOrder || 'DESC';

    queryBuilder.orderBy(`contract.${sortBy}`, sortOrder);
  }
}

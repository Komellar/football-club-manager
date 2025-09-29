import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '@/shared/entities/contract.entity';
import { CreateContractDto, UpdateContractDto } from '@repo/core';

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

  async findAll(): Promise<Contract[]> {
    try {
      return await this.contractRepository.find({
        relations: ['player'],
        order: { startDate: 'DESC' },
      });
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
}

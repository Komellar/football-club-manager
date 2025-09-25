import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { ContractsService } from './contracts.service';
import { Contract } from '@/shared/entities';
import { PaginationHelper } from '../../shared/helpers/pagination.helper';
import {
  ContractStatus,
  ContractType,
  CreateContractDto,
  UpdateContractDto,
  ContractQuery,
} from '@repo/core';

// Mock data
const mockContract = {
  id: 1,
  playerId: 1,
  contractType: ContractType.PROFESSIONAL,
  status: ContractStatus.ACTIVE,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2026-12-31'),
  salary: 50000,
  currency: 'EUR',
  bonuses: 10000,
  signOnFee: 5000,
  releaseClause: 100000000,
  agentFee: 2500,
  notes: 'Test contract',
  createdAt: new Date(),
  updatedAt: new Date(),
  player: null as any,
  get isActive() {
    return this.status === ContractStatus.ACTIVE;
  },
  get isExpired() {
    return this.endDate < new Date();
  },
  get daysUntilExpiry() {
    const now = new Date();
    const timeDiff = this.endDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  },
  get totalValue() {
    return 0;
  },
} as Contract;

const mockCreateContractDto: CreateContractDto = {
  playerId: 1,
  contractType: ContractType.PROFESSIONAL,
  status: ContractStatus.PENDING,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2026-12-31'),
  salary: 50000,
  currency: 'EUR',
  bonuses: 10000,
  signOnFee: 5000,
  releaseClause: 100000000,
  agentFee: 2500,
  notes: 'Test contract',
};

const mockUpdateContractDto: UpdateContractDto = {
  salary: 60000,
  bonuses: 15000,
  notes: 'Updated contract',
};

const mockContractQuery: ContractQuery = {
  page: 1,
  limit: 10,
  sortBy: 'startDate',
  sortOrder: 'DESC',
  playerId: 1,
  status: ContractStatus.ACTIVE,
  contractType: ContractType.PROFESSIONAL,
};

// Mock QueryBuilder
const mockQueryBuilder = {
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
  getMany: jest.fn(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
};

// Mock Repository
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

// Mock PaginationHelper
jest.mock('../../shared/helpers/pagination.helper', () => ({
  PaginationHelper: {
    paginate: jest.fn(),
  },
}));

describe('ContractsService', () => {
  let service: ContractsService;
  let repository: Repository<Contract>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        {
          provide: getRepositoryToken(Contract),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
    repository = module.get<Repository<Contract>>(getRepositoryToken(Contract));

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new contract successfully', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null); // No existing active contract
      mockRepository.create.mockReturnValue(mockContract);
      mockRepository.save.mockResolvedValue(mockContract);

      // Act
      const result = await service.create(mockCreateContractDto);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          playerId: mockCreateContractDto.playerId,
          status: ContractStatus.ACTIVE,
        },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(mockCreateContractDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockContract);
      expect(result).toEqual(mockContract);
    });

    it('should throw BadRequestException if player already has active contract', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockContract);

      // Act & Assert
      await expect(service.create(mockCreateContractDto)).rejects.toThrow(
        new BadRequestException(
          'Player already has an active contract. Please terminate the existing contract first.',
        ),
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(mockCreateContractDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    const mockPaginationResult = {
      data: [mockContract],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };

    beforeEach(() => {
      (PaginationHelper.paginate as jest.Mock).mockResolvedValue(
        mockPaginationResult,
      );
    });

    it('should return paginated contracts', async () => {
      // Act
      const result = await service.findAll(mockContractQuery);

      // Assert
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'contract',
      );
      expect(PaginationHelper.paginate).toHaveBeenCalledWith(mockQueryBuilder, {
        page: mockContractQuery.page,
        limit: mockContractQuery.limit,
      });
      expect(result).toEqual(mockPaginationResult);
    });

    it('should apply filters correctly', async () => {
      // Act
      await service.findAll(mockContractQuery);

      // Assert
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'contract.player',
        'player',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contract.playerId = :playerId',
        {
          playerId: mockContractQuery.playerId,
        },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contract.status = :status',
        {
          status: mockContractQuery.status,
        },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contract.contractType = :contractType',
        {
          contractType: mockContractQuery.contractType,
        },
      );
    });

    it('should handle query without filters', async () => {
      // Act
      await service.findAll();

      // Assert
      expect(PaginationHelper.paginate).toHaveBeenCalledWith(mockQueryBuilder, {
        page: undefined,
        limit: undefined,
      });
    });

    it('should throw InternalServerErrorException on error', async () => {
      // Arrange
      (PaginationHelper.paginate as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findAll(mockContractQuery)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a contract by id', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockResolvedValue(mockContract);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'contract',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'contract.player',
        'player',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('contract.id = :id', {
        id: 1,
      });
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(mockContract);
    });

    it('should throw NotFoundException if contract not found', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow(
        new NotFoundException('Contract with ID 1 not found'),
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByPlayerId', () => {
    it('should return contracts for a specific player', async () => {
      // Arrange
      const contracts = [mockContract];
      mockQueryBuilder.getMany.mockResolvedValue(contracts);

      // Act
      const result = await service.findByPlayerId(1);

      // Assert
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'contract',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'contract.player',
        'player',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'contract.playerId = :playerId',
        { playerId: 1 },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'contract.createdAt',
        'DESC',
      );
      expect(result).toEqual(contracts);
    });

    it('should throw InternalServerErrorException on error', async () => {
      // Arrange
      mockQueryBuilder.getMany.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.findByPlayerId(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findActiveContracts', () => {
    it('should return all active contracts', async () => {
      // Arrange
      const contracts = [mockContract];
      mockQueryBuilder.getMany.mockResolvedValue(contracts);

      // Act
      const result = await service.findActiveContracts();

      // Assert
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'contract',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'contract.player',
        'player',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'contract.status = :status',
        { status: ContractStatus.ACTIVE },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'contract.endDate',
        'ASC',
      );
      expect(result).toEqual(contracts);
    });

    it('should throw InternalServerErrorException on error', async () => {
      // Arrange
      mockQueryBuilder.getMany.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.findActiveContracts()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update a contract successfully', async () => {
      // Arrange
      const existingContract = { ...mockContract };
      const updatedContract = { ...mockContract, ...mockUpdateContractDto };

      // Mock findOne (which uses QueryBuilder)
      mockQueryBuilder.getOne
        .mockResolvedValueOnce(existingContract) // First call to find existing
        .mockResolvedValueOnce(updatedContract); // Second call to return updated

      mockRepository.update.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.update(1, mockUpdateContractDto);

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith(
        1,
        mockUpdateContractDto,
      );
      expect(result).toEqual(updatedContract);
    });

    it('should throw NotFoundException if contract not found', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(1, mockUpdateContractDto)).rejects.toThrow(
        new NotFoundException('Contract with ID 1 not found'),
      );
    });

    it('should validate date relationship when updating dates', async () => {
      // Arrange
      const invalidUpdate = {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2024-01-01'), // End date before start date
      };

      // Mock findOne to return existing contract
      mockQueryBuilder.getOne.mockResolvedValue(mockContract);

      // Act & Assert
      await expect(service.update(1, invalidUpdate)).rejects.toThrow(
        new BadRequestException('End date must be after start date'),
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.update(1, mockUpdateContractDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a contract successfully', async () => {
      // Arrange
      const inactiveContract = {
        ...mockContract,
        status: ContractStatus.TERMINATED,
      };
      mockQueryBuilder.getOne.mockResolvedValue(inactiveContract);
      mockRepository.remove.mockResolvedValue(inactiveContract);

      // Act
      await service.remove(1);

      // Assert
      expect(mockRepository.remove).toHaveBeenCalledWith(inactiveContract);
    });

    it('should throw NotFoundException if contract not found', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow(
        new NotFoundException('Contract with ID 1 not found'),
      );
    });

    it('should throw BadRequestException if trying to delete active contract', async () => {
      // Arrange
      const activeContract = { ...mockContract, status: ContractStatus.ACTIVE };
      mockQueryBuilder.getOne.mockResolvedValue(activeContract);

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow(
        new BadRequestException(
          'Cannot delete an active contract. Please terminate it first.',
        ),
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.remove(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('terminate', () => {
    it('should terminate a contract successfully', async () => {
      // Arrange
      const activeContract = { ...mockContract, status: ContractStatus.ACTIVE };
      const terminatedContract = {
        ...mockContract,
        status: ContractStatus.TERMINATED,
      };

      // Mock findOne calls (QueryBuilder)
      mockQueryBuilder.getOne
        .mockResolvedValueOnce(activeContract) // First call to find existing
        .mockResolvedValueOnce(terminatedContract); // Second call to return terminated

      mockRepository.update.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.terminate(1);

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        status: ContractStatus.TERMINATED,
      });
      expect(result).toEqual(terminatedContract);
    });

    it('should throw NotFoundException if contract not found', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.terminate(1)).rejects.toThrow(
        new NotFoundException('Contract with ID 1 not found'),
      );
    });

    it('should throw BadRequestException if contract is not active', async () => {
      // Arrange
      const inactiveContract = {
        ...mockContract,
        status: ContractStatus.TERMINATED,
      };
      mockQueryBuilder.getOne.mockResolvedValue(inactiveContract);

      // Act & Assert
      await expect(service.terminate(1)).rejects.toThrow(
        new BadRequestException('Only active contracts can be terminated'),
      );
    });
  });
});

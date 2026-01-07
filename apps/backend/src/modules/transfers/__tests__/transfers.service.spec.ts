import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, EntityNotFoundError } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

import { TransfersService } from '../services/transfers.service';
import { Transfer } from '@/shared/entities/transfer.entity';
import { Player } from '@/shared/entities/player.entity';
import {
  TransferStatus,
  TransferType,
  TransferDirection,
  PlayerPosition,
  SortOrder,
} from '@repo/core';
import type {
  CreateTransferDto,
  UpdateTransferDto,
  TransferListDto,
} from '@repo/core';

const createMockPlayer = (overrides = {}): Player => ({
  id: 1,
  name: 'John Doe',
  position: PlayerPosition.FORWARD,
  dateOfBirth: new Date('1995-01-01'),
  country: 'ESP',
  height: 180,
  weight: 75,
  jerseyNumber: 10,
  marketValue: 50000000,
  isActive: true,
  imageUrl: undefined,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  transfers: [],
  contracts: [],
  statistics: [],
  get age() {
    return new Date().getFullYear() - this.dateOfBirth.getFullYear();
  },
  ...overrides,
});

const createMockTransfer = (overrides = {}): Transfer => ({
  id: 1,
  playerId: 1,
  player: null as any, // Will be set by repository
  otherClubName: 'FC Barcelona',
  transferDirection: TransferDirection.INCOMING,
  transferType: TransferType.SIGNING,
  transferStatus: TransferStatus.COMPLETED,
  transferDate: new Date('2024-01-15'),
  transferFee: 50000000,
  agentFee: 5000000,
  annualSalary: 10000000,
  contractLengthMonths: 36,
  loanEndDate: undefined,
  notes: undefined,
  isPermanent: true,
  createdBy: 'admin',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-15'),
  get isCompleted() {
    return this.transferStatus === TransferStatus.COMPLETED;
  },
  get isActiveLoan() {
    if (this.transferType !== TransferType.LOAN) return false;
    if (!this.loanEndDate) return false;
    const now = new Date();
    return now <= this.loanEndDate && this.isCompleted;
  },
  get transferDurationDays() {
    if (this.transferType !== TransferType.LOAN || !this.loanEndDate)
      return null;
    const start = new Date(this.transferDate);
    const end = new Date(this.loanEndDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  },
  ...overrides,
});

describe('TransfersService', () => {
  let service: TransfersService;
  let transferRepository: jest.Mocked<Repository<Transfer>>;
  let playerRepository: jest.Mocked<Repository<Player>>;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<Transfer>>;

  const mockPlayer = createMockPlayer();
  const mockTransfer = createMockTransfer();

  const mockCreateTransferDto: CreateTransferDto = {
    playerId: 1,
    otherClubName: 'FC Barcelona',
    transferDirection: TransferDirection.INCOMING,
    transferType: TransferType.SIGNING,
    transferStatus: TransferStatus.PENDING,
    transferDate: new Date('2024-01-15'),
    transferFee: 50000000,
    agentFee: 5000000,
    annualSalary: 10000000,
    contractLengthMonths: 36,
    isPermanent: true,
    createdBy: 'admin',
  };

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    } as any;

    const mockTransferRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    const mockPlayerRepository = {
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransfersService,
        {
          provide: getRepositoryToken(Transfer),
          useValue: mockTransferRepository,
        },
        {
          provide: getRepositoryToken(Player),
          useValue: mockPlayerRepository,
        },
      ],
    }).compile();

    service = module.get<TransfersService>(TransfersService);
    transferRepository = module.get(getRepositoryToken(Transfer));
    playerRepository = module.get(getRepositoryToken(Player));
  });

  describe('create', () => {
    it('should successfully create a new transfer', async () => {
      playerRepository.findOneOrFail.mockResolvedValue(mockPlayer);
      transferRepository.findOne.mockResolvedValue(null); // No conflicting transfer
      transferRepository.create.mockReturnValue(mockTransfer);
      transferRepository.save.mockResolvedValue(mockTransfer);

      const result = await service.create(mockCreateTransferDto);

      expect(playerRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: mockCreateTransferDto.playerId },
      });
      expect(transferRepository.create).toHaveBeenCalledWith(
        mockCreateTransferDto,
      );
      expect(transferRepository.save).toHaveBeenCalledWith(mockTransfer);
      expect(result).toEqual(
        expect.objectContaining({
          id: mockTransfer.id,
          playerId: mockTransfer.playerId,
          otherClubName: mockTransfer.otherClubName,
          transferDirection: mockTransfer.transferDirection,
        }),
      );
    });

    it('should throw EntityNotFoundError when player does not exist', async () => {
      playerRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError('Player', 'id'),
      );

      await expect(service.create(mockCreateTransferDto)).rejects.toThrow(
        EntityNotFoundError,
      );

      expect(playerRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: mockCreateTransferDto.playerId },
      });
      expect(transferRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when player has conflicting active transfer', async () => {
      const completedTransferDto = {
        ...mockCreateTransferDto,
        transferStatus: TransferStatus.COMPLETED,
        transferType: TransferType.SIGNING,
      };

      playerRepository.exists.mockResolvedValue(true);
      transferRepository.findOne.mockResolvedValue(mockTransfer); // Active transfer exists

      await expect(service.create(completedTransferDto)).rejects.toThrow(
        new BadRequestException(
          'Player already has an active transfer. Complete or cancel the existing transfer first.',
        ),
      );
    });

    it('should allow loan return when player has active transfer', async () => {
      const loanReturnDto = {
        ...mockCreateTransferDto,
        transferStatus: TransferStatus.COMPLETED,
        transferType: TransferType.LOAN_RETURN,
      };
      const loanReturnTransfer = createMockTransfer({
        transferType: TransferType.LOAN_RETURN,
      });

      playerRepository.exists.mockResolvedValue(true);
      transferRepository.findOne.mockResolvedValue(mockTransfer); // Active transfer exists
      transferRepository.create.mockReturnValue(loanReturnTransfer);
      transferRepository.save.mockResolvedValue(loanReturnTransfer);

      const result = await service.create(loanReturnDto);

      expect(result).toEqual(
        expect.objectContaining({
          id: loanReturnTransfer.id,
          transferType: TransferType.LOAN_RETURN,
        }),
      );
    });

    it('should throw Error on unexpected error', async () => {
      playerRepository.exists.mockRejectedValue(new Error('Database error'));

      await expect(service.create(mockCreateTransferDto)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated transfers with default pagination', async () => {
      const transfers = [mockTransfer];
      const total = 1;

      transferRepository.findAndCount.mockResolvedValue([transfers, total]);

      const result = await service.findAll();

      expect(transferRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0, // (page 1 - 1) * limit 10
        take: 10,
      });

      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({ id: mockTransfer.id }),
        ]),
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    });

    it('should return paginated transfers with custom pagination', async () => {
      const queryDto: Partial<TransferListDto> = {
        page: 2,
        limit: 5,
      };
      const transfers = [mockTransfer];
      const total = 15;

      transferRepository.findAndCount.mockResolvedValue([transfers, total]);

      const result = await service.findAll(queryDto);

      expect(transferRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 5, // (page 2 - 1) * limit 5
        take: 5,
        order: { updatedAt: SortOrder.DESC },
      });

      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should apply filters correctly', async () => {
      const queryDto = {
        where: {
          playerId: 1,
          transferType: TransferType.SIGNING,
          transferStatus: TransferStatus.COMPLETED,
          transferDirection: TransferDirection.INCOMING,
          otherClubName: 'Barcelona',
          isPermanent: true,
          minFee: 1000000,
          maxFee: 100000000,
        },
      } as TransferListDto;

      transferRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(queryDto);

      // QueryHelper processes filters and creates the where clause
      expect(transferRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            playerId: expect.objectContaining({ _type: 'equal', _value: 1 }),
            transferType: expect.objectContaining({
              _type: 'equal',
              _value: TransferType.SIGNING,
            }),
            transferStatus: expect.objectContaining({
              _type: 'equal',
              _value: TransferStatus.COMPLETED,
            }),
            transferDirection: expect.objectContaining({
              _type: 'equal',
              _value: TransferDirection.INCOMING,
            }),
            // otherClubName should be processed with ILike for partial matching
            otherClubName: expect.objectContaining({ _type: 'ilike' }),
            isPermanent: expect.objectContaining({
              _type: 'equal',
              _value: true,
            }),
            // minFee and maxFee now use Equal operator (not GTE/LTE)
            minFee: expect.objectContaining({
              _type: 'equal',
              _value: 1000000,
            }),
            maxFee: expect.objectContaining({
              _type: 'equal',
              _value: 100000000,
            }),
          }),
          order: { updatedAt: SortOrder.DESC },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should throw Error on database error', async () => {
      transferRepository.findAndCount.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findAll()).rejects.toThrow(Error);
    });
  });

  describe('findOne', () => {
    it('should return a transfer by ID', async () => {
      transferRepository.findOneOrFail.mockResolvedValue(mockTransfer);

      const result = await service.findOne(1);

      expect(transferRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: mockTransfer.id,
          playerId: mockTransfer.playerId,
        }),
      );
    });

    it('should throw EntityNotFoundError when transfer does not exist', async () => {
      transferRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(Transfer, { id: 999 }),
      );

      await expect(service.findOne(999)).rejects.toThrow(EntityNotFoundError);
    });

    it('should throw Error on database error', async () => {
      transferRepository.findOneOrFail.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findOne(1)).rejects.toThrow(Error);
    });
  });

  describe('findByPlayer', () => {
    it('should return player transfer history', async () => {
      const mockTransferList = [mockTransfer];
      playerRepository.findOneOrFail.mockResolvedValue(mockPlayer);
      transferRepository.find.mockResolvedValue(mockTransferList);

      const result = await service.findByPlayer(1);

      expect(result).toBeDefined();
      expect(result.playerId).toBe(1);
      expect(result.playerName).toBe('John Doe');
      expect(result.transfers).toHaveLength(1);
      expect(result.totalTransfers).toBe(1);
    });

    it('should throw EntityNotFoundError when player does not exist', async () => {
      playerRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(Player, { id: 999 }),
      );

      await expect(service.findByPlayer(999)).rejects.toThrow(
        EntityNotFoundError,
      );
    });

    it('should calculate career value correctly excluding transfers without fees', async () => {
      const transfers = [
        createMockTransfer({ id: 1, transferFee: 50000000 }),
        createMockTransfer({ id: 2, transferFee: null }), // No fee
        createMockTransfer({ id: 3, transferFee: 20000000 }),
      ];

      playerRepository.findOneOrFail.mockResolvedValue(mockPlayer);
      transferRepository.find.mockResolvedValue(transfers);

      const result = await service.findByPlayer(1);

      expect(result.careerTransfersValue).toBe(70000000); // 50M + 0 + 20M
    });
  });

  describe('update', () => {
    const updateTransferDto: UpdateTransferDto = {
      otherClubName: 'Manchester United',
      transferFee: 75000000,
    };

    it('should successfully update a transfer', async () => {
      const pendingTransfer = createMockTransfer({
        transferStatus: TransferStatus.PENDING,
      });
      const updatedTransfer = createMockTransfer({
        ...pendingTransfer,
        ...updateTransferDto,
      });

      transferRepository.findOneOrFail.mockResolvedValue(pendingTransfer);
      transferRepository.save.mockResolvedValue(updatedTransfer);

      const result = await service.update(1, updateTransferDto);

      expect(transferRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(transferRepository.save).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          toClub: 'Manchester United',
          transferFee: 75000000,
        }),
      );
    });

    it('should throw EntityNotFoundError when transfer does not exist', async () => {
      transferRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(Transfer, { id: 999 }),
      );

      await expect(service.update(999, updateTransferDto)).rejects.toThrow(
        EntityNotFoundError,
      );
    });

    it('should throw BadRequestException when trying to change status of completed transfer', async () => {
      const completedTransfer = createMockTransfer({
        transferStatus: TransferStatus.COMPLETED,
      });
      const invalidUpdate = { transferStatus: TransferStatus.CANCELLED };

      transferRepository.findOneOrFail.mockResolvedValue(completedTransfer);

      await expect(service.update(1, invalidUpdate)).rejects.toThrow(
        new BadRequestException('Cannot change status of completed transfer'),
      );
    });

    it('should allow updating completed transfer to completed status', async () => {
      const completedTransfer = createMockTransfer({
        transferStatus: TransferStatus.COMPLETED,
      });
      const validUpdate = {
        transferStatus: TransferStatus.COMPLETED,
        notes: 'Updated notes',
      };
      const updatedTransfer = createMockTransfer({
        ...completedTransfer,
        ...validUpdate,
      });

      transferRepository.findOneOrFail.mockResolvedValue(completedTransfer);
      transferRepository.save.mockResolvedValue(updatedTransfer);

      const result = await service.update(1, validUpdate);

      expect(result).toEqual(
        expect.objectContaining({
          notes: 'Updated notes',
        }),
      );
    });

    it('should throw Error on database error', async () => {
      transferRepository.findOneOrFail.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.update(1, updateTransferDto)).rejects.toThrow(Error);
    });
  });

  describe('remove', () => {
    it('should successfully remove a pending transfer', async () => {
      const pendingTransfer = createMockTransfer({
        transferStatus: TransferStatus.PENDING,
      });

      transferRepository.findOneOrFail.mockResolvedValue(pendingTransfer);
      transferRepository.remove.mockResolvedValue(pendingTransfer);

      await service.remove(1);

      expect(transferRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['player'],
      });
      expect(transferRepository.remove).toHaveBeenCalledWith(pendingTransfer);
    });

    it('should throw EntityNotFoundError when transfer does not exist', async () => {
      transferRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(Transfer, { id: 999 }),
      );

      await expect(service.remove(999)).rejects.toThrow(EntityNotFoundError);
    });

    it('should throw BadRequestException when trying to delete completed transfer', async () => {
      const completedTransfer = createMockTransfer({
        transferStatus: TransferStatus.COMPLETED,
      });

      transferRepository.findOneOrFail.mockResolvedValue(completedTransfer);

      await expect(service.remove(1)).rejects.toThrow(
        new BadRequestException('Cannot delete completed transfers'),
      );
    });

    it('should throw Error on database error', async () => {
      transferRepository.findOneOrFail.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.remove(1)).rejects.toThrow(Error);
    });
  });

  describe('private methods', () => {
    describe('mapToResponseDto', () => {
      it('should correctly map transfer entity to response DTO', () => {
        // Access the private method through the service instance
        const result = (service as any).mapToResponseDto(mockTransfer);

        expect(result).toEqual({
          id: mockTransfer.id,
          playerId: mockTransfer.playerId,
          otherClubName: mockTransfer.otherClubName,
          transferDirection: mockTransfer.transferDirection,
          transferType: mockTransfer.transferType,
          transferStatus: mockTransfer.transferStatus,
          transferDate: mockTransfer.transferDate,
          transferFee: mockTransfer.transferFee,
          agentFee: mockTransfer.agentFee,
          annualSalary: mockTransfer.annualSalary,
          contractLengthMonths: mockTransfer.contractLengthMonths,
          loanEndDate: mockTransfer.loanEndDate,
          notes: mockTransfer.notes,
          isPermanent: mockTransfer.isPermanent,
          createdBy: mockTransfer.createdBy,
          createdAt: mockTransfer.createdAt,
          updatedAt: mockTransfer.updatedAt,
          isCompleted: mockTransfer.isCompleted,
          isActiveLoan: mockTransfer.isActiveLoan,
          transferDurationDays: undefined, // null becomes undefined
        });
      });
    });
  });
});

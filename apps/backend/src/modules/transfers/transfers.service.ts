import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Transfer } from '@/shared/entities/transfer.entity';
import { Player } from '@/shared/entities/player.entity';
import { TransferStatus, TransferType } from '@repo/core';
import type {
  CreateTransferDto,
  UpdateTransferDto,
  TransferResponseDto,
  TransferQueryDto,
  PaginatedTransferResponseDto,
  TransferHistoryDto,
} from '@repo/core';
import { PaginationHelper } from '@/shared/helpers/pagination.helper';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(Transfer)
    private transferRepository: Repository<Transfer>,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {}

  async create(
    createTransferDto: CreateTransferDto,
  ): Promise<TransferResponseDto> {
    try {
      const player = await this.playerRepository.findOne({
        where: { id: createTransferDto.playerId },
      });

      if (!player) {
        throw new NotFoundException(
          `Player with ID ${createTransferDto.playerId} not found`,
        );
      }

      // Check for conflicting active transfers
      if (createTransferDto.transferStatus === TransferStatus.COMPLETED) {
        const activeTransfer = await this.transferRepository.findOne({
          where: {
            playerId: createTransferDto.playerId,
            transferStatus: TransferStatus.COMPLETED,
          },
          order: { transferDate: 'DESC' },
        });

        if (
          activeTransfer &&
          createTransferDto.transferType !== TransferType.LOAN_RETURN
        ) {
          throw new BadRequestException(
            'Player already has an active transfer. Complete or cancel the existing transfer first.',
          );
        }
      }

      const transfer = this.transferRepository.create(createTransferDto);
      const savedTransfer = await this.transferRepository.save(transfer);

      return this.mapToResponseDto(savedTransfer);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create transfer. Please try again.',
      );
    }
  }

  async findAll(
    queryDto?: Partial<TransferQueryDto>,
  ): Promise<PaginatedTransferResponseDto> {
    try {
      const queryBuilder =
        this.transferRepository.createQueryBuilder('transfer');

      // Join with player for additional filtering capabilities
      queryBuilder.leftJoinAndSelect('transfer.player', 'player');

      this.applyFilters(queryBuilder, queryDto);
      this.applySorting(queryBuilder, queryDto);

      const paginationResult = await PaginationHelper.paginate(queryBuilder, {
        page: queryDto?.page,
        limit: queryDto?.limit,
      });

      return {
        data: paginationResult.data.map((transfer) =>
          this.mapToResponseDto(transfer),
        ),
        pagination: paginationResult.pagination,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to retrieve transfers. Please try again.',
      );
    }
  }

  async findOne(id: number): Promise<TransferResponseDto> {
    try {
      const transfer = await this.transferRepository.findOne({
        where: { id },
        relations: ['player'],
      });

      if (!transfer) {
        throw new NotFoundException(`Transfer with ID ${id} not found`);
      }

      return this.mapToResponseDto(transfer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve transfer. Please try again.',
      );
    }
  }

  async findByPlayer(playerId: number): Promise<TransferHistoryDto> {
    try {
      const player = await this.playerRepository.findOne({
        where: { id: playerId },
      });

      if (!player) {
        throw new NotFoundException(`Player with ID ${playerId} not found`);
      }

      const transfers = await this.transferRepository.find({
        where: { playerId },
        order: { transferDate: 'DESC' },
      });

      const currentTransfer = transfers.find(
        (t) =>
          t.transferStatus === TransferStatus.COMPLETED &&
          (t.transferType !== TransferType.LOAN || t.isActiveLoan),
      );

      const careerTransfersValue = transfers
        .filter((t) => t.transferFee)
        .reduce((sum, t) => sum + (t.transferFee || 0), 0);

      return {
        playerId,
        playerName: player.name,
        transfers: transfers.map((transfer) => this.mapToResponseDto(transfer)),
        totalTransfers: transfers.length,
        currentClub: currentTransfer?.toClub,
        careerTransfersValue,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve player transfer history. Please try again.',
      );
    }
  }

  async update(
    id: number,
    updateTransferDto: UpdateTransferDto,
  ): Promise<TransferResponseDto> {
    try {
      const transfer = await this.transferRepository.findOne({
        where: { id },
      });

      if (!transfer) {
        throw new NotFoundException(`Transfer with ID ${id} not found`);
      }

      if (
        transfer.transferStatus === TransferStatus.COMPLETED &&
        updateTransferDto.transferStatus !== TransferStatus.COMPLETED
      ) {
        throw new BadRequestException(
          'Cannot change status of completed transfer',
        );
      }

      Object.assign(transfer, updateTransferDto);
      const updatedTransfer = await this.transferRepository.save(transfer);

      return this.mapToResponseDto(updatedTransfer);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update transfer. Please try again.',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const transfer = await this.transferRepository.findOne({
        where: { id },
      });

      if (!transfer) {
        throw new NotFoundException(`Transfer with ID ${id} not found`);
      }

      if (transfer.transferStatus === TransferStatus.COMPLETED) {
        throw new BadRequestException('Cannot delete completed transfers');
      }

      await this.transferRepository.remove(transfer);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete transfer. Please try again.',
      );
    }
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Transfer>,
    queryDto?: Partial<TransferQueryDto>,
  ): void {
    if (!queryDto) return;

    // Player filter
    if (queryDto.playerId) {
      queryBuilder.andWhere('transfer.playerId = :playerId', {
        playerId: queryDto.playerId,
      });
    }

    // Transfer type filter
    if (queryDto.transferType) {
      queryBuilder.andWhere('transfer.transferType = :transferType', {
        transferType: queryDto.transferType,
      });
    }

    // Transfer status filter
    if (queryDto.transferStatus) {
      queryBuilder.andWhere('transfer.transferStatus = :transferStatus', {
        transferStatus: queryDto.transferStatus,
      });
    }

    // Permanent transfer filter (check for undefined to allow false values)
    if (queryDto.isPermanent !== undefined) {
      queryBuilder.andWhere('transfer.isPermanent = :isPermanent', {
        isPermanent: queryDto.isPermanent,
      });
    }

    // Club name filters (case-insensitive partial match)
    if (queryDto.fromClub) {
      queryBuilder.andWhere('transfer.fromClub ILIKE :fromClub', {
        fromClub: `%${queryDto.fromClub}%`,
      });
    }

    if (queryDto.toClub) {
      queryBuilder.andWhere('transfer.toClub ILIKE :toClub', {
        toClub: `%${queryDto.toClub}%`,
      });
    }

    // Date range filters
    if (queryDto.dateFrom) {
      queryBuilder.andWhere('transfer.transferDate >= :dateFrom', {
        dateFrom: queryDto.dateFrom,
      });
    }

    if (queryDto.dateTo) {
      queryBuilder.andWhere('transfer.transferDate <= :dateTo', {
        dateTo: queryDto.dateTo,
      });
    }

    // Fee range filters
    if (queryDto.minFee !== undefined) {
      queryBuilder.andWhere('transfer.transferFee >= :minFee', {
        minFee: queryDto.minFee,
      });
    }

    if (queryDto.maxFee !== undefined) {
      queryBuilder.andWhere('transfer.transferFee <= :maxFee', {
        maxFee: queryDto.maxFee,
      });
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Transfer>,
    queryDto?: Partial<TransferQueryDto>,
  ): void {
    const sortBy = queryDto?.sortBy || 'transferDate';
    const sortOrder = (queryDto?.sortOrder || 'desc').toUpperCase() as
      | 'ASC'
      | 'DESC';

    // Map sortBy field to database column
    const sortField = `transfer.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);
  }

  private mapToResponseDto(transfer: Transfer): TransferResponseDto {
    return {
      id: transfer.id,
      playerId: transfer.playerId,
      fromClub: transfer.fromClub,
      toClub: transfer.toClub,
      transferType: transfer.transferType,
      transferStatus: transfer.transferStatus,
      transferDate: transfer.transferDate,
      transferFee: transfer.transferFee,
      agentFee: transfer.agentFee,
      annualSalary: transfer.annualSalary,
      contractLengthMonths: transfer.contractLengthMonths,
      loanEndDate: transfer.loanEndDate,
      notes: transfer.notes,
      isPermanent: transfer.isPermanent,
      createdBy: transfer.createdBy,
      createdAt: transfer.createdAt,
      updatedAt: transfer.updatedAt,
      isCompleted: transfer.isCompleted,
      isActiveLoan: transfer.isActiveLoan,
      transferDurationDays: transfer.transferDurationDays ?? undefined,
    };
  }
}

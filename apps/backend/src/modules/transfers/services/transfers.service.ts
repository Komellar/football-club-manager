import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transfer } from '@/shared/entities/transfer.entity';
import { Player } from '@/shared/entities/player.entity';
import { TransferStatus, TransferType, FilterMode } from '@repo/core';
import type {
  CreateTransferDto,
  UpdateTransferDto,
  TransferResponseDto,
  TransferListDto,
  PaginatedTransferResponseDto,
  TransferHistoryDto,
  FilterOptions,
} from '@repo/core';
import { ListQueryBuilder } from '@/shared/query/list-query-builder';

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
    // This will throw EntityNotFoundError if player doesn't exist
    await this.playerRepository.findOneOrFail({
      where: { id: createTransferDto.playerId },
    });

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
  }

  async findAll(
    queryDto?: Partial<TransferListDto>,
  ): Promise<PaginatedTransferResponseDto> {
    const filterOptions: FilterOptions = {
      defaultFilterMode: FilterMode.EXACT,
      filterModes: {
        fromClub: FilterMode.PARTIAL,
        toClub: FilterMode.PARTIAL,
      },
      searchOptions: {
        searchFields: ['fromClub', 'toClub'],
        searchMode: FilterMode.PARTIAL,
      },
    };

    const result = await ListQueryBuilder.executeQuery(
      this.transferRepository,
      queryDto,
      filterOptions,
    );

    return {
      data: result.data.map((transfer) => this.mapToResponseDto(transfer)),
      pagination: result.pagination,
    };
  }

  async findOne(id: number): Promise<TransferResponseDto> {
    const transfer = await this.transferRepository.findOneOrFail({
      where: { id },
    });

    return this.mapToResponseDto(transfer);
  }

  async findByPlayer(playerId: number): Promise<TransferHistoryDto> {
    const player = await this.playerRepository.findOneOrFail({
      where: { id: playerId },
    });

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
  }

  async update(
    id: number,
    updateTransferDto: UpdateTransferDto,
  ): Promise<TransferResponseDto> {
    const transfer = await this.transferRepository.findOneOrFail({
      where: { id },
    });

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
  }

  async remove(id: number): Promise<void> {
    const transfer = await this.transferRepository.findOneOrFail({
      where: { id },
      relations: ['player'],
    });

    if (transfer.transferStatus === TransferStatus.COMPLETED) {
      throw new BadRequestException('Cannot delete completed transfers');
    }

    await this.transferRepository.remove(transfer);
  }

  private mapToResponseDto(transfer: Transfer): TransferResponseDto {
    // Create response DTO excluding the 'player' relation and including computed properties
    const {
      id,
      playerId,
      fromClub,
      toClub,
      transferType,
      transferStatus,
      transferDate,
      transferFee,
      agentFee,
      annualSalary,
      contractLengthMonths,
      loanEndDate,
      notes,
      isPermanent,
      createdBy,
      createdAt,
      updatedAt,
    } = transfer;

    return {
      id,
      playerId,
      fromClub,
      toClub,
      transferType,
      transferStatus,
      transferDate,
      transferFee,
      agentFee,
      annualSalary,
      contractLengthMonths,
      loanEndDate,
      notes,
      isPermanent,
      createdBy,
      createdAt,
      updatedAt,
      isCompleted: transfer.isCompleted,
      isActiveLoan: transfer.isActiveLoan,
      transferDurationDays: transfer.transferDurationDays ?? undefined,
    };
  }
}

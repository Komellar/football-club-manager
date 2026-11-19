import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transfer } from '@/shared/entities/transfer.entity';
import { Player } from '@/shared/entities/player.entity';
import {
  TransferStatus,
  FilterMode,
  SortOrder,
  CreateTransferValidationSchema,
} from '@repo/core';
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
import { getTransferOwnership } from './transfer-lifecycle';
import {
  isPermanentDeparture,
  terminateContractsOnDeparture,
} from '@/modules/contracts/services/contract-rules';

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
    const data = this.validate(createTransferDto);
    return this.transferRepository.manager.transaction(async (manager) => {
      await manager.getRepository(Player).findOneOrFail({
        where: { id: data.playerId },
        lock: { mode: 'pessimistic_write' },
      });
      const repository = manager.getRepository(Transfer);
      await this.validateLifecycle(repository, data);
      const saved = await repository.save(repository.create(data));
      if (saved.isCompleted && isPermanentDeparture(saved))
        await terminateContractsOnDeparture(
          manager,
          saved.playerId,
          saved.transferDate,
        );
      return this.mapToResponseDto(saved);
    });
  }

  async findAll(
    queryDto?: Partial<TransferListDto>,
  ): Promise<PaginatedTransferResponseDto> {
    const filterOptions: FilterOptions = {
      defaultFilterMode: FilterMode.EXACT,
      filterModes: {
        otherClubName: FilterMode.PARTIAL,
      },
      fieldAliases: {
        dateFrom: { field: 'transferDate', mode: FilterMode.GTE },
        dateTo: { field: 'transferDate', mode: FilterMode.LTE },
      },
      searchOptions: {
        searchFields: ['otherClubName'],
        searchMode: FilterMode.PARTIAL,
      },
    };

    const result = await ListQueryBuilder.executeQuery(
      this.transferRepository,
      queryDto,
      filterOptions,
      ['player'],
    );

    return {
      data: result.data.map((transfer) => this.mapToResponseDto(transfer)),
      pagination: result.pagination,
    };
  }

  async findOne(id: number): Promise<TransferResponseDto> {
    const transfer = await this.transferRepository.findOneOrFail({
      where: { id },
      relations: ['player'],
    });

    return this.mapToResponseDto(transfer);
  }

  async findByPlayer(playerId: number): Promise<TransferHistoryDto> {
    const player = await this.playerRepository.findOneOrFail({
      where: { id: playerId },
    });

    const transfers = await this.transferRepository.find({
      where: { playerId },
      order: { transferDate: SortOrder.DESC },
    });

    const careerTransfersValue = transfers
      .filter((t) => t.isCompleted && t.transferFee)
      .reduce((sum, t) => sum + (t.transferFee || 0), 0);

    const { currentClub } = getTransferOwnership(transfers, new Date());

    return {
      playerId,
      playerName: player.name,
      transfers: transfers.map((transfer) => this.mapToResponseDto(transfer)),
      totalTransfers: transfers.length,
      currentClub,
      careerTransfersValue,
    };
  }

  async update(
    id: number,
    updateTransferDto: UpdateTransferDto,
  ): Promise<TransferResponseDto> {
    const existing = await this.transferRepository.findOneOrFail({
      where: { id },
    });
    return this.transferRepository.manager.transaction(async (manager) => {
      await manager.getRepository(Player).findOneOrFail({
        where: { id: existing.playerId },
        lock: { mode: 'pessimistic_write' },
      });
      const repository = manager.getRepository(Transfer);
      const transfer = await repository.findOneOrFail({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (
        transfer.isCompleted &&
        updateTransferDto.transferStatus !== undefined &&
        updateTransferDto.transferStatus !== TransferStatus.COMPLETED
      ) {
        throw new BadRequestException(
          'Cannot change status of completed transfer',
        );
      }
      const fields = Object.fromEntries(
        Object.entries(updateTransferDto).filter(
          ([, value]) => value !== undefined,
        ),
      );
      const data = this.validate({ ...transfer, ...fields });
      const lifecycleFields = [
        'transferType',
        'transferDirection',
        'transferDate',
        'loanEndDate',
        'otherClubName',
        'transferStatus',
      ];
      if (lifecycleFields.some((field) => Object.hasOwn(fields, field)))
        await this.validateLifecycle(repository, data, id);
      const wasCompleted = transfer.isCompleted;
      const saved = await repository.save(Object.assign(transfer, data));
      if (!wasCompleted && saved.isCompleted && isPermanentDeparture(saved))
        await terminateContractsOnDeparture(
          manager,
          saved.playerId,
          saved.transferDate,
        );
      return this.mapToResponseDto(saved);
    });
  }

  async remove(id: number): Promise<void> {
    const existing = await this.transferRepository.findOneOrFail({
      where: { id },
    });
    await this.transferRepository.manager.transaction(async (manager) => {
      await manager.getRepository(Player).findOneOrFail({
        where: { id: existing.playerId },
        lock: { mode: 'pessimistic_write' },
      });
      const repository = manager.getRepository(Transfer);
      const transfer = await repository.findOneOrFail({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (transfer.isCompleted) {
        throw new BadRequestException('Cannot delete completed transfers');
      }
      await repository.remove(transfer);
    });
  }

  private mapToResponseDto(transfer: Transfer): TransferResponseDto {
    // Create response DTO including the player relation and computed properties
    const {
      id,
      playerId,
      player,
      otherClubName,
      transferDirection,
      transferType,
      transferStatus,
      transferDate,
      transferFee,
      agentFee,
      loanEndDate,
      notes,
      createdBy,
      createdAt,
      updatedAt,
    } = transfer;

    return {
      id,
      playerId,
      player: player
        ? {
            id: player.id,
            name: player.name,
            position: player.position,
            dateOfBirth: player.dateOfBirth,
            country: player.country,
            height: player.height,
            weight: player.weight,
            jerseyNumber: player.jerseyNumber,
            marketValue: player.marketValue,
            isActive: player.isActive,
            imageUrl: player.imageUrl,
            createdAt: player.createdAt,
            updatedAt: player.updatedAt,
            age: player.age,
          }
        : undefined,
      otherClubName: otherClubName ?? undefined,
      transferDirection,
      transferType,
      transferStatus,
      transferDate,
      transferFee: transferFee ?? undefined,
      agentFee: agentFee ?? undefined,
      loanEndDate: loanEndDate ?? undefined,
      notes: notes ?? undefined,
      createdBy: createdBy ?? undefined,
      createdAt,
      updatedAt,
      isCompleted: transfer.isCompleted,
      isActiveLoan: transfer.isActiveLoan,
      transferDurationDays: transfer.transferDurationDays ?? undefined,
    };
  }

  private validate(data: unknown): CreateTransferDto {
    const parsed = CreateTransferValidationSchema.safeParse(data);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues);
    return parsed.data;
  }

  private async validateLifecycle(
    repository: Repository<Transfer>,
    data: CreateTransferDto,
    id?: number,
  ) {
    if (data.transferStatus !== TransferStatus.COMPLETED) return;
    const history = await repository.find({
      where: {
        playerId: data.playerId,
        transferStatus: TransferStatus.COMPLETED,
      },
    });
    try {
      getTransferOwnership([
        ...history.filter((transfer) => transfer.id !== id),
        { ...data, id },
      ]);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Invalid transfer lifecycle',
      );
    }
  }
}

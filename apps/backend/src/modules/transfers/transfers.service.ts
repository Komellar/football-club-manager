import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
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
import { ListQueryBuilder } from '../../shared/query/list-query-builder';

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
      const playerExists = await this.playerRepository.exists({
        where: { id: createTransferDto.playerId },
      });

      if (!playerExists) {
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
    queryDto?: Partial<TransferListDto>,
  ): Promise<PaginatedTransferResponseDto> {
    try {
      const filterOptions: FilterOptions = {
        defaultFilterMode: FilterMode.EXACT, // Default to exact matching
        filterModes: {
          fromClub: FilterMode.PARTIAL,
          toClub: FilterMode.PARTIAL,
          minFee: FilterMode.GTE,
          maxFee: FilterMode.LTE,
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
        relations: ['player'],
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
        `Failed to delete transfer with id ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private mapToResponseDto(transfer: Transfer): TransferResponseDto {
    // Destructure to exclude the 'player' relation and include computed properties
    const { player: _player, ...transferDto } = transfer;
    return {
      ...transferDto,
      isCompleted: transfer.isCompleted,
      isActiveLoan: transfer.isActiveLoan,
      transferDurationDays: transfer.transferDurationDays ?? undefined,
    };
  }
}

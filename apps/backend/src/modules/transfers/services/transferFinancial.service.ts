import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transfer } from '@/shared/entities/transfer.entity';
import { TransferStatus, TransferDirection } from '@repo/core';

@Injectable()
export class TransferFinancialService {
  constructor(
    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,
  ) {}

  async calculateTotalTransfers(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    transferIncome: number;
    transferExpenses: number;
    transferAgentFees: number;
  }> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const transfers = await this.transferRepository.find({
      where: {
        transferDate: Between(start, end),
        transferStatus: TransferStatus.COMPLETED,
      },
    });

    let transferIncome = 0;
    let transferExpenses = 0;
    let transferAgentFees = 0;

    for (const transfer of transfers) {
      const fee = Number(transfer.transferFee || 0);
      const agentFee = Number(transfer.agentFee || 0);

      if (transfer.transferDirection === TransferDirection.OUTGOING) {
        console.log('outgoing transfer fee:', fee);
        transferIncome += fee;
      } else if (transfer.transferDirection === TransferDirection.INCOMING) {
        transferExpenses += fee;
        transferAgentFees += agentFee;
      }
    }

    return {
      transferIncome,
      transferExpenses,
      transferAgentFees,
    };
  }
}

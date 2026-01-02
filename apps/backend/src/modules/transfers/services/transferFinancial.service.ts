import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, And, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Transfer } from '@/shared/entities/transfer.entity';
import { TransferStatus, TransferType } from '@repo/core';

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
    const transfers = await this.transferRepository.find({
      where: {
        transferDate: And(MoreThanOrEqual(startDate), LessThanOrEqual(endDate)),
        transferStatus: TransferStatus.COMPLETED,
      },
    });

    let transferIncome = 0;
    let transferExpenses = 0;
    let transferAgentFees = 0;

    for (const transfer of transfers) {
      const fee = Number(transfer.transferFee || 0);
      const agentFee = Number(transfer.agentFee || 0);

      // Determine if it's income or expense based on transfer type
      switch (transfer.transferType) {
        case TransferType.SALE:
        case TransferType.LOAN:
          transferIncome += fee;
          break;
        case TransferType.SIGNING:
        case TransferType.RELEASE:
        case TransferType.LOAN_RETURN:
          transferExpenses += fee;
          transferAgentFees += agentFee;
          break;
        default:
          break;
      }
    }

    return {
      transferIncome,
      transferExpenses,
      transferAgentFees,
    };
  }
}

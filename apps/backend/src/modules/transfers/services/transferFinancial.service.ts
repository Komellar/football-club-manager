import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transfer } from '@/shared/entities/transfer.entity';
import { TransferStatus, TransferDirection } from '@repo/core';
import { fromCents, toCents } from '@/shared/utils/money';

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

    let incomeCents = 0;
    let expenseCents = 0;
    let agentFeeCents = 0;

    for (const transfer of transfers) {
      const fee = toCents(transfer.transferFee);
      if (transfer.transferDirection === TransferDirection.OUTGOING) {
        incomeCents += fee;
      } else if (transfer.transferDirection === TransferDirection.INCOMING) {
        expenseCents += fee;
      }
      // Agents are paid on sales as well as purchases.
      agentFeeCents += toCents(transfer.agentFee);
    }

    return {
      transferIncome: fromCents(incomeCents),
      transferExpenses: fromCents(expenseCents),
      transferAgentFees: fromCents(agentFeeCents),
    };
  }
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Player } from './player.entity';
import { TransferType, TransferStatus, TransferDirection } from '@repo/core';

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'player_id' })
  @Index()
  playerId: number;

  @ManyToOne(() => Player, (player) => player.transfers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'other_club_name',
    nullable: true,
    comment: 'The other club involved in the transfer (not the users club)',
  })
  otherClubName?: string;

  @Column({
    type: 'enum',
    enum: TransferDirection,
    name: 'transfer_direction',
    comment: 'Direction: incoming (to my club) or outgoing (from my club)',
  })
  @Index()
  transferDirection: TransferDirection;

  @Column({
    type: 'enum',
    enum: TransferType,
    name: 'transfer_type',
  })
  transferType: TransferType;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PENDING,
    name: 'transfer_status',
  })
  transferStatus: TransferStatus;

  @Column({ type: 'date', name: 'transfer_date' })
  transferDate: Date;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    name: 'transfer_fee',
    comment: 'Transfer fee paid for the player',
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value ? parseFloat(value) : null),
    },
  })
  transferFee?: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'agent_fee',
    comment: 'Agent commission fee for the transfer',
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value ? parseFloat(value) : null),
    },
  })
  agentFee?: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'annual_salary',
    comment: 'Annual salary agreed in the transfer',
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value ? parseFloat(value) : null),
    },
  })
  annualSalary?: number;

  @Column({
    type: 'int',
    nullable: true,
    name: 'contract_length_months',
  })
  contractLengthMonths?: number;

  @Column({ type: 'date', nullable: true, name: 'loan_end_date' })
  loanEndDate?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: false, name: 'is_permanent' })
  isPermanent: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'created_by' })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  get isCompleted(): boolean {
    return this.transferStatus === TransferStatus.COMPLETED;
  }

  get isActiveLoan(): boolean {
    if (this.transferType !== TransferType.LOAN) return false;
    if (!this.loanEndDate) return false;

    const now = new Date();
    return now <= this.loanEndDate && this.isCompleted;
  }

  get transferDurationDays(): number | null {
    if (this.transferType !== TransferType.LOAN || !this.loanEndDate)
      return null;

    const start = new Date(this.transferDate);
    const end = new Date(this.loanEndDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
}

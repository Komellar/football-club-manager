import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';
import { ContractStatus, ContractType } from '@repo/core';
import { Player } from './player.entity';

@Entity('contracts')
@Index(['playerId', 'status'])
@Index(['startDate', 'endDate'])
@Index(['status'])
@Index(['contractType'])
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'player_id' })
  @Index()
  playerId: number;

  @Column({
    type: 'enum',
    enum: ContractType,
    name: 'contract_type',
  })
  contractType: ContractType;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.PENDING,
  })
  status: ContractStatus;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Monthly salary in the specified currency',
  })
  salary: number;

  @Column({ type: 'varchar', length: 3, default: 'EUR' })
  currency: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    comment: 'Performance and achievement bonuses',
  })
  bonuses?: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    name: 'sign_on_fee',
    comment: 'One-time signing fee',
  })
  signOnFee?: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    name: 'release_clause',
    comment: 'Contract release clause amount',
  })
  releaseClause?: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    name: 'agent_fee',
    comment: 'Agent commission fee',
  })
  agentFee?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Player, (player) => player.contracts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'player_id' })
  player: Relation<Player>;

  get isActive(): boolean {
    return this.status === ContractStatus.ACTIVE;
  }

  get isExpired(): boolean {
    const now = new Date();
    return this.endDate < now;
  }

  get daysUntilExpiry(): number {
    const now = new Date();
    const timeDiff = this.endDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  get totalValue(): number {
    const monthsDiff = this.getMonthsDifference(this.startDate, this.endDate);
    const salaryTotal = this.salary * monthsDiff;
    const bonusesTotal = this.bonuses || 0;
    const signOnFeeTotal = this.signOnFee || 0;
    return salaryTotal + bonusesTotal + signOnFeeTotal;
  }

  private getMonthsDifference(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const yearsDiff = end.getFullYear() - start.getFullYear();
    const monthsDiff = end.getMonth() - start.getMonth();

    return yearsDiff * 12 + monthsDiff;
  }
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  Relation,
} from 'typeorm';
import { PlayerPosition } from '@repo/core';
import { Transfer } from './transfer.entity';
import { Contract } from './contract.entity';
import { PlayerStatistics } from './player-statistics.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  name: string;

  @Column({
    type: 'enum',
    enum: PlayerPosition,
  })
  position: PlayerPosition;

  @Column({ type: 'date', name: 'date_of_birth' })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 50 })
  nationality: string;

  @Column({ type: 'int', nullable: true, comment: 'Height in centimeters' })
  height?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Weight in kilograms',
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value ? parseFloat(value) : null),
    },
  })
  weight?: number;

  @Column({ type: 'int', name: 'jersey_number', nullable: true })
  jerseyNumber?: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'market_value',
    nullable: true,
    comment: 'Current market value of the player',
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value ? parseFloat(value) : null),
    },
  })
  marketValue?: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'image_url' })
  imageUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Transfer, (transfer) => transfer.player)
  transfers: Transfer[];

  @OneToMany(() => Contract, (contract) => contract.player)
  contracts: Relation<Contract[]>;

  @OneToMany(() => PlayerStatistics, (stats) => stats.player, { cascade: true })
  statistics: PlayerStatistics[];

  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}

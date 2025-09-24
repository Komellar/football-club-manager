import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { PlayerPosition } from '@repo/core';
import { Transfer } from '../../common/entities/transfer.entity';

@Entity('players')
@Index(['position', 'isActive'])
@Index(['nationality'])
@Index(['jerseyNumber'], {
  unique: true,
  where: 'jersey_number IS NOT NULL AND is_active = true',
})
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

  @Column({ type: 'int', nullable: true })
  height?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'int', name: 'jersey_number', nullable: true })
  jerseyNumber?: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'market_value',
    nullable: true,
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

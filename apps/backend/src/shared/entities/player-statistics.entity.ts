import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Player } from './player.entity';

@Entity('player_statistics')
export class PlayerStatistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'player_id' })
  playerId: number;

  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column({ type: 'varchar', length: 9, comment: 'Format: 2023-2024' })
  season: string;

  @Column({ type: 'int', default: 0, name: 'matches_played' })
  matchesPlayed: number;

  @Column({ type: 'int', default: 0, name: 'minutes_played' })
  minutesPlayed: number;

  @Column({ type: 'int', default: 0 })
  goals: number;

  @Column({ type: 'int', default: 0 })
  assists: number;

  @Column({ type: 'int', default: 0, name: 'yellow_cards' })
  yellowCards: number;

  @Column({ type: 'int', default: 0, name: 'red_cards' })
  redCards: number;

  @Column({ type: 'int', default: 0, name: 'clean_sheets' })
  cleanSheets: number;

  @Column({ type: 'int', default: 0, name: 'saves_made' })
  savesMade: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 1,
    nullable: true,
    comment: 'Match rating from 1.0 to 10.0',
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value ? parseFloat(value) : null),
    },
  })
  rating?: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 1,
    nullable: true,
    name: 'average_rating',
    comment: 'Average rating from 1.0 to 10.0 (e.g., 6.8)',
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value ? parseFloat(value) : null),
    },
  })
  averageRating?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type {
  FixtureStatus,
  MatchEventPlayer,
  MatchSimulationState,
} from '@repo/core';

@Entity('fixtures')
export class Fixture {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'opponent_name', length: 100 }) opponentName: string;
  @Column({ length: 100 }) competition: string;
  @Column({ name: 'kickoff_at', type: 'timestamptz' }) kickoffAt: Date;
  @Column({ type: 'varchar', length: 20, default: 'scheduled' })
  status: FixtureStatus;
  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  lineup: MatchEventPlayer[];
  @Column({ type: 'jsonb', nullable: true })
  result: MatchSimulationState | null;
  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

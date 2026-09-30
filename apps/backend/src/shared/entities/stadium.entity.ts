import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

const money = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};
@Entity('stadium')
export class Stadium {
  @PrimaryColumn({ type: 'smallint' }) id: number;
  @Column({ length: 100 }) name: string;
  @Column({ type: 'int' }) capacity: number;
  @Column({
    name: 'default_ticket_price',
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: money,
  })
  defaultTicketPrice: number;
  @Column({ name: 'expected_occupancy', type: 'double precision' })
  expectedOccupancy: number;
  @Column({
    name: 'monthly_maintenance',
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: money,
  })
  monthlyMaintenance: number;
  @Column({
    name: 'security_cost',
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: money,
  })
  securityCost: number;
  @Column({
    name: 'staffing_cost',
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: money,
  })
  staffingCost: number;
  @Column({
    name: 'cleaning_cost',
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: money,
  })
  cleaningCost: number;
  @Column({
    name: 'utilities_cost',
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: money,
  })
  utilitiesCost: number;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

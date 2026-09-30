import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity('stadium_maintenance_rates')
export class StadiumMaintenanceRate {
  @PrimaryColumn({ name: 'effective_from', type: 'date' })
  effectiveFrom: string;
  @Column({
    name: 'monthly_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  monthlyAmount: number;
}

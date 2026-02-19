import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  SponsorshipType,
  SponsorshipStatus,
  PaymentFrequency,
} from '@repo/core';

@Entity('sponsorships')
export class Sponsorship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, name: 'sponsor_name' })
  @Index()
  sponsorName: string;

  @Column({
    type: 'enum',
    enum: SponsorshipType,
    name: 'sponsorship_type',
  })
  @Index()
  sponsorshipType: SponsorshipType;

  @Column({
    type: 'enum',
    enum: SponsorshipStatus,
    default: SponsorshipStatus.ACTIVE,
    name: 'sponsorship_status',
  })
  @Index()
  sponsorshipStatus: SponsorshipStatus;

  @Column({ type: 'date', name: 'start_date' })
  @Index()
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  @Index()
  endDate: Date;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'annual_value',
    comment: 'Annual sponsorship value',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  annualValue: number;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'payment_frequency',
    default: PaymentFrequency.ANNUALLY,
  })
  paymentFrequency: PaymentFrequency;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'contact_person',
  })
  contactPerson?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'contact_email',
  })
  contactEmail?: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    name: 'contact_phone',
  })
  contactPhone?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  get isActive(): boolean {
    const now = new Date();
    return (
      this.sponsorshipStatus === SponsorshipStatus.ACTIVE &&
      this.startDate <= now &&
      this.endDate >= now
    );
  }

  get daysRemaining(): number | null {
    if (!this.isActive) return null;
    const now = new Date();
    const end = new Date(this.endDate);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  get monthlyValue(): number {
    switch (this.paymentFrequency) {
      case PaymentFrequency.MONTHLY:
        return this.annualValue / 12;
      case PaymentFrequency.QUARTERLY:
        return this.annualValue / 4;
      case PaymentFrequency.ANNUALLY:
      default:
        return this.annualValue / 12;
    }
  }
}

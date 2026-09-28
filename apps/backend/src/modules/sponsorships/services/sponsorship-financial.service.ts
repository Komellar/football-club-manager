import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { PaymentFrequency, SponsorshipStatus } from '@repo/core';
import type { SponsorshipPayment } from '@repo/core';
import { Sponsorship } from '@/shared/entities/sponsorship.entity';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function calendarDate(value: Date | string): Date {
  const date = new Date(value);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addCalendarMonths(start: Date, months: number): Date {
  const year = start.getUTCFullYear();
  const month = start.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(start.getUTCDate(), lastDay)));
}

/** Scheduled receipts are projections; the application does not track actual payments. */
export function buildSponsorshipPaymentSchedule(
  sponsorship: Sponsorship,
  rangeStart?: Date,
  rangeEnd?: Date,
): SponsorshipPayment[] {
  if (
    sponsorship.sponsorshipStatus !== SponsorshipStatus.ACTIVE &&
    sponsorship.sponsorshipStatus !== SponsorshipStatus.EXPIRED
  ) {
    return [];
  }

  const start = calendarDate(sponsorship.startDate);
  const end = calendarDate(sponsorship.endDate);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start > end
  ) {
    return [];
  }
  const firstRequestedDate = rangeStart && calendarDate(rangeStart);
  const lastRequestedDate = rangeEnd && calendarDate(rangeEnd);

  const frequencyMonths = {
    [PaymentFrequency.MONTHLY]: 1,
    [PaymentFrequency.QUARTERLY]: 3,
    [PaymentFrequency.ANNUALLY]: 12,
  }[sponsorship.paymentFrequency];
  if (!frequencyMonths) return [];

  const payments: SponsorshipPayment[] = [];
  for (let months = 0; ; months += frequencyMonths) {
    const paymentDate = addCalendarMonths(start, months);
    if (paymentDate > end) break;
    const nextPaymentDate = addCalendarMonths(start, months + frequencyMonths);
    const coveredUntil = new Date(
      Math.min(end.getTime() + MS_PER_DAY, nextPaymentDate.getTime()),
    );
    const coveredDays =
      (coveredUntil.getTime() - paymentDate.getTime()) / MS_PER_DAY;
    const periodDays =
      (nextPaymentDate.getTime() - paymentDate.getTime()) / MS_PER_DAY;
    const amount =
      Math.round(
        Number(sponsorship.annualValue) *
          100 *
          (frequencyMonths / 12) *
          (coveredDays / periodDays),
      ) / 100;

    if (
      (!firstRequestedDate || paymentDate >= firstRequestedDate) &&
      (!lastRequestedDate || paymentDate <= lastRequestedDate)
    ) {
      payments.push({ date: paymentDate.toISOString().slice(0, 10), amount });
    }
  }

  return payments;
}

@Injectable()
export class SponsorshipFinancialService {
  constructor(
    @InjectRepository(Sponsorship)
    private readonly sponsorshipRepository: Repository<Sponsorship>,
  ) {}

  async calculateScheduledIncome(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const sponsorships = await this.sponsorshipRepository.find({
      where: {
        sponsorshipStatus: In([
          SponsorshipStatus.ACTIVE,
          SponsorshipStatus.EXPIRED,
        ]),
        startDate: LessThanOrEqual(endDate),
        endDate: MoreThanOrEqual(startDate),
      },
    });

    const totalCents = sponsorships.reduce(
      (sum, sponsorship) =>
        sum +
        buildSponsorshipPaymentSchedule(sponsorship, startDate, endDate).reduce(
          (paymentSum, payment) =>
            paymentSum + Math.round(payment.amount * 100),
          0,
        ),
      0,
    );
    return totalCents / 100;
  }
}

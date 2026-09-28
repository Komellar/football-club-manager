import { PaymentFrequency, SponsorshipStatus } from '@repo/core';
import { Sponsorship } from '@/shared/entities/sponsorship.entity';
import { buildSponsorshipPaymentSchedule } from '../services/sponsorship-financial.service';

const deal = (overrides: Partial<Sponsorship> = {}): Sponsorship =>
  ({
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    annualValue: 1200,
    paymentFrequency: PaymentFrequency.MONTHLY,
    sponsorshipStatus: SponsorshipStatus.ACTIVE,
    ...overrides,
  }) as Sponsorship;

describe('buildSponsorshipPaymentSchedule', () => {
  it.each([
    [PaymentFrequency.MONTHLY, 12, 100],
    [PaymentFrequency.QUARTERLY, 4, 300],
    [PaymentFrequency.ANNUALLY, 1, 1200],
  ])('creates %s installments', (frequency, count, amount) => {
    const payments = buildSponsorshipPaymentSchedule(
      deal({ paymentFrequency: frequency }),
    );

    expect(payments).toHaveLength(count);
    expect(payments.every((payment) => payment.amount === amount)).toBe(true);
    expect(payments.reduce((sum, payment) => sum + payment.amount, 0)).toBe(
      1200,
    );
  });

  it('prorates the final installment and filters by payment date', () => {
    const sponsorship = deal({ endDate: new Date('2026-02-14') });

    expect(buildSponsorshipPaymentSchedule(sponsorship)).toEqual([
      { date: '2026-01-01', amount: 100 },
      { date: '2026-02-01', amount: 50 },
    ]);
    expect(
      buildSponsorshipPaymentSchedule(
        sponsorship,
        new Date('2026-02-01'),
        new Date('2026-02-28'),
      ),
    ).toEqual([{ date: '2026-02-01', amount: 50 }]);
  });

  it('retains historical expired deals and excludes pending or cancelled deals', () => {
    expect(
      buildSponsorshipPaymentSchedule(
        deal({ sponsorshipStatus: SponsorshipStatus.EXPIRED }),
      ),
    ).toHaveLength(12);
    for (const status of [
      SponsorshipStatus.PENDING,
      SponsorshipStatus.CANCELLED,
    ]) {
      expect(
        buildSponsorshipPaymentSchedule(deal({ sponsorshipStatus: status })),
      ).toEqual([]);
    }
  });

  it('keeps the original calendar day when a month is shorter', () => {
    const payments = buildSponsorshipPaymentSchedule(
      deal({
        startDate: new Date('2026-01-31'),
        endDate: new Date('2026-03-31'),
      }),
    );
    expect(payments.map((payment) => payment.date)).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
    ]);
  });

  it('uses annual value for the monthly average regardless of payment frequency', () => {
    const sponsorship = Object.assign(
      new Sponsorship(),
      deal({ paymentFrequency: PaymentFrequency.QUARTERLY }),
    );
    expect(sponsorship.monthlyValue).toBe(100);
  });
});

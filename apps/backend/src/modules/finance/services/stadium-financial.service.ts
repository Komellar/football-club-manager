import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Fixture } from '@/shared/entities/fixture.entity';
import { StadiumMaintenanceRate } from '@/shared/entities/stadium-maintenance-rate.entity';
const DAY = 86400000;
const calendarDate = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
/** Maintenance accrues per UTC calendar day using the rate effective that day. */
export function maintenanceExpense(
  rates: StadiumMaintenanceRate[],
  startDate: Date,
  endDate: Date,
): number {
  const start = calendarDate(startDate).getTime(),
    end = calendarDate(endDate).getTime();
  let cents = 0;
  for (let i = 0; i < rates.length; i++) {
    const rate = rates[i]!;
    const next = rates[i + 1];
    const first = Math.max(start, new Date(rate.effectiveFrom).getTime());
    const last = Math.min(
      end,
      next ? new Date(next.effectiveFrom).getTime() - DAY : end,
    );
    for (let time = first; time <= last; ) {
      const date = new Date(time);
      const monthEnd = Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        0,
      );
      const segmentEnd = Math.min(last, monthEnd);
      const days = (segmentEnd - time) / DAY + 1;
      cents +=
        (Math.round(rate.monthlyAmount * 100) * days) /
        new Date(monthEnd).getUTCDate();
      time = segmentEnd + DAY;
    }
  }
  return Math.round(cents) / 100;
}
@Injectable()
export class StadiumFinancialService {
  constructor(
    @InjectRepository(Fixture) private readonly fixtures: Repository<Fixture>,
    @InjectRepository(StadiumMaintenanceRate)
    private readonly rates: Repository<StadiumMaintenanceRate>,
  ) {}
  async calculatePeriod(startDate: Date, endDate: Date) {
    // One completed fixture row is counted once, including after save retries.
    const periodStart = calendarDate(startDate),
      periodEnd = new Date(calendarDate(endDate).getTime() + DAY - 1);
    const totals = await this.fixtures
      .createQueryBuilder('f')
      .select(
        "COALESCE(SUM((f.matchday->>'ticketRevenue')::numeric),0)",
        'ticketSales',
      )
      .addSelect(
        "COALESCE(SUM((f.matchday->>'operatingCosts')::numeric),0)",
        'matchdayCosts',
      )
      .where('f.status = :status', { status: 'completed' })
      .andWhere('f.matchday IS NOT NULL')
      .andWhere('f.completedAt BETWEEN :start AND :end', {
        start: periodStart,
        end: periodEnd,
      })
      .getRawOne<{ ticketSales: string; matchdayCosts: string }>();
    const rates = await this.rates.find({
      where: {
        effectiveFrom: LessThanOrEqual(endDate.toISOString().slice(0, 10)),
      },
      order: { effectiveFrom: 'ASC' },
    });
    return {
      ticketSales: Number(totals?.ticketSales ?? 0),
      matchdayCosts: Number(totals?.matchdayCosts ?? 0),
      stadiumMaintenance: maintenanceExpense(rates, startDate, endDate),
    };
  }
}

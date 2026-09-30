import {
  maintenanceExpense,
  StadiumFinancialService,
} from '../services/stadium-financial.service';
import { StadiumMaintenanceRate } from '@/shared/entities/stadium-maintenance-rate.entity';
import { Fixture } from '@/shared/entities/fixture.entity';
import { Repository } from 'typeorm';
const rate = (effectiveFrom: string, monthlyAmount: number) => ({
  effectiveFrom,
  monthlyAmount,
});
describe('stadium financial reporting', () => {
  it('prorates partial months and handles leap years', () => {
    expect(
      maintenanceExpense(
        [rate('2024-02-01', 2900)],
        new Date('2024-02-28'),
        new Date('2024-02-29'),
      ),
    ).toBe(200);
    expect(
      maintenanceExpense(
        [rate('2026-01-01', 3100)],
        new Date('2026-01-01'),
        new Date('2026-01-31'),
      ),
    ).toBe(3100);
  });
  it('uses historical rates and does not charge days before configuration', () => {
    expect(
      maintenanceExpense(
        [rate('2026-09-16', 3000), rate('2026-10-01', 6200)],
        new Date('2026-09-01'),
        new Date('2026-10-02'),
      ),
    ).toBe(1900);
    expect(
      maintenanceExpense([], new Date('2026-09-01'), new Date('2026-09-30')),
    ).toBe(0);
  });
  it('includes all of the end date and only completed match snapshots', async () => {
    const builder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest
        .fn()
        .mockResolvedValue({
          ticketSales: '120000.30',
          matchdayCosts: '650.10',
        }),
    };
    const fixtures = {
      createQueryBuilder: () => builder,
    } as unknown as Repository<Fixture>;
    const rates = {
      find: jest.fn().mockResolvedValue([rate('2026-09-30', 3000)]),
    } as unknown as Repository<StadiumMaintenanceRate>;
    const service = new StadiumFinancialService(fixtures, rates);
    const result = await service.calculatePeriod(
      new Date('2026-09-30'),
      new Date('2026-09-30'),
    );
    expect(result).toEqual({
      ticketSales: 120000.3,
      matchdayCosts: 650.1,
      stadiumMaintenance: 100,
    });
    expect(builder.where).toHaveBeenCalledWith('f.status = :status', {
      status: 'completed',
    });
    expect(builder.andWhere).toHaveBeenCalledWith(
      'f.completedAt BETWEEN :start AND :end',
      {
        start: new Date('2026-09-30T00:00:00Z'),
        end: new Date('2026-09-30T23:59:59.999Z'),
      },
    );
  });
});

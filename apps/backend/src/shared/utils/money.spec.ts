import { dayIndex, proratedMonthlyCents, sumMoney, toCents } from './money';

describe('money helpers', () => {
  it('adds amounts exactly to the cent', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(sumMoney(0.1, 0.2)).toBe(0.3);
    expect(sumMoney('1234.56', null, undefined, -0.56)).toBe(1234);
    expect(toCents(19.999)).toBe(2000);
  });

  it('charges each month for the share of its days', () => {
    const from = dayIndex('2026-02-15');
    const to = dayIndex('2026-03-31');
    // 14/28 of February plus all of March.
    expect(proratedMonthlyCents(100_000, from, to)).toBeCloseTo(150_000);
  });
});

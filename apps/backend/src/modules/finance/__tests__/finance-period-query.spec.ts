import { FinancePeriodQuerySchema } from '@repo/core';

describe('FinancePeriodQuerySchema', () => {
  const parse = (startDate: string, endDate: string) =>
    FinancePeriodQuerySchema.safeParse({ startDate, endDate });

  it('accepts a normal period', () => {
    const result = parse('2025-01-01', '2025-12-31');
    expect(result.success).toBe(true);
    expect(result.data?.startDate).toEqual(new Date('2025-01-01'));
  });

  it('accepts exactly ten years', () => {
    expect(parse('2015-01-01', '2025-01-01').success).toBe(true);
  });

  it('rejects periods longer than ten years (one query batch per month)', () => {
    expect(parse('0001-01-01', '9999-12-31').success).toBe(false);
    expect(parse('2015-01-01', '2025-01-02').success).toBe(false);
  });

  it('rejects reversed and invalid dates', () => {
    expect(parse('2025-12-31', '2025-01-01').success).toBe(false);
    expect(parse('not-a-date', '2025-01-01').success).toBe(false);
    expect(
      FinancePeriodQuerySchema.safeParse({ startDate: '2025-01-01' }).success,
    ).toBe(false);
  });
});

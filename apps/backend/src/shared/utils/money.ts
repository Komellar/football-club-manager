/**
 * Money is stored as DECIMAL(12,2) and read as JS numbers. Sums go through
 * integer cents so they don't pick up floating-point drift (0.1 + 0.2).
 */
export function toCents(value: number | string | null | undefined): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

export function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

/** Adds money amounts exactly to the cent. */
export function sumMoney(
  ...values: (number | string | null | undefined)[]
): number {
  return fromCents(values.reduce<number>((sum, v) => sum + toCents(v), 0));
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Days since the epoch for the UTC calendar day of a date. */
export function dayIndex(value: Date | string): number {
  const date = new Date(value);
  return (
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
    MS_PER_DAY
  );
}

/**
 * Cost in cents of a monthly amount over the calendar days [fromDay, toDay]
 * (inclusive day indexes). Each month is charged for the share of its days
 * that fall in the period, so half of a 30-day month costs half the salary.
 */
export function proratedMonthlyCents(
  monthlyCents: number,
  fromDay: number,
  toDay: number,
): number {
  let cents = 0;
  let cursor = fromDay;
  while (cursor <= toDay) {
    const date = new Date(cursor * MS_PER_DAY);
    const monthEnd =
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0) / MS_PER_DAY;
    const daysInMonth = new Date(monthEnd * MS_PER_DAY).getUTCDate();
    const segmentEnd = Math.min(toDay, monthEnd);
    cents += (monthlyCents * (segmentEnd - cursor + 1)) / daysInMonth;
    cursor = segmentEnd + 1;
  }
  return cents;
}

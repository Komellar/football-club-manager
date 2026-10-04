import type { ValueTransformer } from 'typeorm';

/** PostgreSQL DATE values are UTC calendar dates, even when the driver returns strings. */
export const dateColumnTransformer: ValueTransformer = {
  to: (value: Date | string | null | undefined) =>
    value == null ? value : new Date(value).toISOString().slice(0, 10),
  from: (value: Date | string | null) =>
    value == null ? value : new Date(value),
};

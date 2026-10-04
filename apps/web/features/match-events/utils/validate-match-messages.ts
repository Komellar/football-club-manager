import type { ZodType } from "zod";
import { EMPTY, mergeMap, of, type OperatorFunction } from "rxjs";

export function validateMatchMessages<T>(
  schema: ZodType<T>,
  onInvalid: () => void,
): OperatorFunction<unknown, T> {
  return mergeMap((payload: unknown) => {
    const parsed = schema.safeParse(payload);
    if (parsed.success) return of(parsed.data);
    onInvalid();
    return EMPTY;
  });
}

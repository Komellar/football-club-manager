import { z } from "zod";

export const DateRangeQuerySchema = z
  .object({
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
      }
      return true;
    },
    {
      message: "dateFrom must be before or equal to dateTo",
      path: ["dateTo"],
    }
  );

export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;

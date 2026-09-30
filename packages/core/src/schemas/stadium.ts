import { z } from "zod";

export const MoneyAmountSchema = z
  .number()
  .min(0)
  .max(10_000_000)
  .refine(
    (value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.000001,
    "Use at most two decimal places",
  );
export const TicketPriceSchema = MoneyAmountSchema.refine(
  (value) => value <= 10_000,
  "Ticket price must be at most 10,000",
);
export const StadiumSettingsSchema = z.object({
  name: z.string().trim().min(2).max(100),
  capacity: z.number().int().min(1).max(1_000_000),
  defaultTicketPrice: TicketPriceSchema,
  expectedOccupancy: z.number().min(0).max(100),
  monthlyMaintenance: MoneyAmountSchema,
  securityCost: MoneyAmountSchema,
  staffingCost: MoneyAmountSchema,
  cleaningCost: MoneyAmountSchema,
  utilitiesCost: MoneyAmountSchema,
});
export type StadiumSettings = z.infer<typeof StadiumSettingsSchema>;

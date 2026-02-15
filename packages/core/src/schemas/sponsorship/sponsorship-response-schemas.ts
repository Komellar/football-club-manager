import { z } from "zod";
import {
  SponsorshipType,
  SponsorshipStatus,
  PaymentFrequency,
} from "../../enums/sponsorship";

export const SponsorshipResponseSchema = z.object({
  id: z.number().int().positive(),
  sponsorName: z.string(),
  sponsorshipType: z.enum(SponsorshipType),
  sponsorshipStatus: z.enum(SponsorshipStatus),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  annualValue: z.number(),
  paymentFrequency: z.enum(PaymentFrequency),
  description: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  isActive: z.boolean(),
  daysRemaining: z.number().optional(),
  monthlyValue: z.number(),
});

export type SponsorshipResponseDto = z.infer<typeof SponsorshipResponseSchema>;

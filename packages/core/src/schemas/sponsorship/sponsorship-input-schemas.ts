import { z } from "zod";
import {
  SponsorshipType,
  SponsorshipStatus,
  PaymentFrequency,
} from "../../enums/sponsorship";

export const CreateSponsorshipSchema = z.object({
  sponsorName: z
    .string()
    .trim()
    .min(2, "Sponsor name must be at least 2 characters")
    .max(100, "Sponsor name must be less than 100 characters"),

  sponsorshipType: z.enum(SponsorshipType),

  sponsorshipStatus: z.enum(SponsorshipStatus),

  startDate: z.coerce.date<Date>("Invalid date"),

  endDate: z.coerce.date<Date>("Invalid date"),

  annualValue: z
    .number()
    .positive("Annual value must be positive")
    .max(500000000, "Annual value cannot exceed 500 million"),

  paymentFrequency: z.enum(PaymentFrequency),

  contactPerson: z
    .string()
    .trim()
    .max(100, "Contact person must be less than 100 characters")
    .optional(),

  contactEmail: z
    .email("Invalid email format")
    .max(100, "Email must be less than 100 characters")
    .optional(),

  contactPhone: z
    .string()
    .trim()
    .max(20, "Phone must be less than 20 characters")
    .optional(),

  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
});

export const UpdateSponsorshipSchema = CreateSponsorshipSchema.partial();

export type CreateSponsorshipDto = z.infer<typeof CreateSponsorshipSchema>;
export type UpdateSponsorshipDto = z.infer<typeof UpdateSponsorshipSchema>;

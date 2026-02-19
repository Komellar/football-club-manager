import { SponsorshipResponseDto, UpdateSponsorshipDto } from "@repo/core";

export function transformToFormValues(
  sponsorship: SponsorshipResponseDto,
): UpdateSponsorshipDto {
  return {
    sponsorName: sponsorship.sponsorName,
    sponsorshipType: sponsorship.sponsorshipType,
    sponsorshipStatus: sponsorship.sponsorshipStatus,
    startDate: new Date(sponsorship.startDate),
    endDate: new Date(sponsorship.endDate),
    annualValue: sponsorship.annualValue,
    paymentFrequency: sponsorship.paymentFrequency,
    contactPerson: sponsorship.contactPerson ?? undefined,
    contactEmail: sponsorship.contactEmail ?? undefined,
    contactPhone: sponsorship.contactPhone ?? undefined,
    notes: sponsorship.notes ?? undefined,
  };
}

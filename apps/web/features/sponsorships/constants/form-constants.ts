import {
  CreateSponsorshipDto,
  SponsorshipType,
  SponsorshipStatus,
  PaymentFrequency,
} from "@repo/core";

export const DEFAULT_SPONSORSHIP_FORM_VALUES: Partial<CreateSponsorshipDto> = {
  sponsorshipStatus: SponsorshipStatus.ACTIVE,
  paymentFrequency: PaymentFrequency.ANNUALLY,
  sponsorshipType: SponsorshipType.KIT_SPONSOR,
};

export const SPONSORSHIP_TYPE_OPTIONS = [
  { value: SponsorshipType.KIT_SPONSOR, labelKey: "typeValues.kitSponsor" },
  {
    value: SponsorshipType.STADIUM_NAMING,
    labelKey: "typeValues.stadiumNaming",
  },
  { value: SponsorshipType.TRAINING_KIT, labelKey: "typeValues.trainingKit" },
  {
    value: SponsorshipType.SLEEVE_SPONSOR,
    labelKey: "typeValues.sleeveSponsor",
  },
  {
    value: SponsorshipType.REGIONAL_PARTNER,
    labelKey: "typeValues.regionalPartner",
  },
  {
    value: SponsorshipType.OFFICIAL_PARTNER,
    labelKey: "typeValues.officialPartner",
  },
  {
    value: SponsorshipType.TECHNICAL_SPONSOR,
    labelKey: "typeValues.technicalSponsor",
  },
];

export const SPONSORSHIP_STATUS_OPTIONS = [
  { value: SponsorshipStatus.PENDING, labelKey: "statusValues.pending" },
  { value: SponsorshipStatus.ACTIVE, labelKey: "statusValues.active" },
  { value: SponsorshipStatus.EXPIRED, labelKey: "statusValues.expired" },
  { value: SponsorshipStatus.CANCELLED, labelKey: "statusValues.cancelled" },
];

export const PAYMENT_FREQUENCY_OPTIONS = [
  { value: PaymentFrequency.MONTHLY, labelKey: "paymentFrequency.monthly" },
  {
    value: PaymentFrequency.QUARTERLY,
    labelKey: "paymentFrequency.quarterly",
  },
  { value: PaymentFrequency.ANNUALLY, labelKey: "paymentFrequency.annually" },
];

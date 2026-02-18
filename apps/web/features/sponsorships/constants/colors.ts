import { SponsorshipType, SponsorshipStatus } from "@repo/core";

export const sponsorshipTypeColors: Record<SponsorshipType, string> = {
  [SponsorshipType.KIT_SPONSOR]: "bg-blue-100 text-blue-800 border-blue-200",
  [SponsorshipType.STADIUM_NAMING]:
    "bg-purple-100 text-purple-800 border-purple-200",
  [SponsorshipType.TRAINING_KIT]: "bg-cyan-100 text-cyan-800 border-cyan-200",
  [SponsorshipType.SLEEVE_SPONSOR]:
    "bg-green-100 text-green-800 border-green-200",
  [SponsorshipType.REGIONAL_PARTNER]:
    "bg-yellow-100 text-yellow-800 border-yellow-200",
  [SponsorshipType.OFFICIAL_PARTNER]:
    "bg-orange-100 text-orange-800 border-orange-200",
  [SponsorshipType.TECHNICAL_SPONSOR]:
    "bg-indigo-100 text-indigo-800 border-indigo-200",
};

export const sponsorshipStatusColors: Record<SponsorshipStatus, string> = {
  [SponsorshipStatus.PENDING]:
    "bg-yellow-100 text-yellow-800 border-yellow-200",
  [SponsorshipStatus.ACTIVE]: "bg-green-100 text-green-800 border-green-200",
  [SponsorshipStatus.EXPIRED]: "bg-gray-100 text-gray-800 border-gray-200",
  [SponsorshipStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
};

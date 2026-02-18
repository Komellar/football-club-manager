import { SponsorshipType, SponsorshipStatus } from "@repo/core";
import {
  sponsorshipTypeColors,
  sponsorshipStatusColors,
} from "../constants/colors";

export function formatSponsorshipType(type: SponsorshipType): string {
  const typeMap: Record<SponsorshipType, string> = {
    [SponsorshipType.KIT_SPONSOR]: "Kit Sponsor",
    [SponsorshipType.STADIUM_NAMING]: "Stadium Naming",
    [SponsorshipType.TRAINING_KIT]: "Training Kit",
    [SponsorshipType.SLEEVE_SPONSOR]: "Sleeve Sponsor",
    [SponsorshipType.REGIONAL_PARTNER]: "Regional Partner",
    [SponsorshipType.OFFICIAL_PARTNER]: "Official Partner",
    [SponsorshipType.TECHNICAL_SPONSOR]: "Technical Sponsor",
  };
  return typeMap[type];
}

export function formatSponsorshipStatus(status: SponsorshipStatus): string {
  const statusMap: Record<SponsorshipStatus, string> = {
    [SponsorshipStatus.PENDING]: "Pending",
    [SponsorshipStatus.ACTIVE]: "Active",
    [SponsorshipStatus.EXPIRED]: "Expired",
    [SponsorshipStatus.CANCELLED]: "Cancelled",
  };
  return statusMap[status];
}

export function getSponsorshipTypeColor(type: SponsorshipType): string {
  return sponsorshipTypeColors[type];
}

export function getSponsorshipStatusColor(status: SponsorshipStatus): string {
  return sponsorshipStatusColors[status];
}

"use server";

import { revalidatePath } from "next/cache";
import {
  createSponsorship,
  updateSponsorship,
  deleteSponsorship,
} from "../api";
import type {
  CreateSponsorshipDto,
  UpdateSponsorshipDto,
  SponsorshipResponseDto,
} from "@repo/core";

export async function createSponsorshipAction(
  data: CreateSponsorshipDto
): Promise<SponsorshipResponseDto> {
  const result = await createSponsorship(data);
  revalidatePath("/sponsorships");
  return result;
}

export async function updateSponsorshipAction(
  id: number,
  data: UpdateSponsorshipDto
): Promise<SponsorshipResponseDto> {
  const result = await updateSponsorship(id, data);
  revalidatePath("/sponsorships");
  return result;
}

export async function deleteSponsorshipAction(sponsorshipId: number) {
  await deleteSponsorship(sponsorshipId);
  revalidatePath("/sponsorships");
}

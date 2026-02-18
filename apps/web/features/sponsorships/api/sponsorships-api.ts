"use server";

import { AxiosError, AxiosResponse } from "axios";
import { apiClient } from "@/lib/api-client";
import type {
  SponsorshipListDto,
  PaginatedSponsorshipResponseDto,
  SponsorshipResponseDto,
  CreateSponsorshipDto,
  UpdateSponsorshipDto,
} from "@repo/core";

export async function getSponsorships(
  params?: SponsorshipListDto,
): Promise<PaginatedSponsorshipResponseDto> {
  try {
    const { data }: AxiosResponse<PaginatedSponsorshipResponseDto> =
      await apiClient.get("/sponsorships", { params });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch sponsorships";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to fetch sponsorships");
  }
}

export async function getSponsorshipById(
  id: number,
): Promise<SponsorshipResponseDto> {
  try {
    const { data }: AxiosResponse<SponsorshipResponseDto> = await apiClient.get(
      `/sponsorships/${id}`,
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch sponsorship";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to fetch sponsorship");
  }
}

export async function createSponsorship(
  sponsorshipData: CreateSponsorshipDto,
): Promise<SponsorshipResponseDto> {
  try {
    const { data }: AxiosResponse<SponsorshipResponseDto> =
      await apiClient.post("/sponsorships", sponsorshipData);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to create sponsorship";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to create sponsorship");
  }
}

export async function updateSponsorship(
  id: number,
  sponsorshipData: UpdateSponsorshipDto,
): Promise<SponsorshipResponseDto> {
  try {
    const { data }: AxiosResponse<SponsorshipResponseDto> =
      await apiClient.patch(`/sponsorships/${id}`, sponsorshipData);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to update sponsorship";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to update sponsorship");
  }
}

export async function deleteSponsorship(id: number): Promise<void> {
  try {
    await apiClient.delete(`/sponsorships/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete sponsorship";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to delete sponsorship");
  }
}

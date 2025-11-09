import { AxiosError, AxiosResponse } from "axios";
import { apiClient } from "@/lib/api-client";
import type {
  PlayerStatisticsResponseDto,
  PlayerStatisticsQueryDto,
  PaginationResult,
} from "@repo/core";

const BASE_URL = "/statistics";

export async function getPlayerStatistics(
  playerId: number,
  params?: Partial<PlayerStatisticsQueryDto>
): Promise<PaginationResult<PlayerStatisticsResponseDto>> {
  try {
    const {
      data,
    }: AxiosResponse<PaginationResult<PlayerStatisticsResponseDto>> =
      await apiClient.get(`${BASE_URL}/player/${playerId}`, {
        params,
      });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch player statistics";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to fetch player statistics");
  }
}

export async function getStatisticsById(
  id: number
): Promise<PlayerStatisticsResponseDto> {
  try {
    const { data }: AxiosResponse<PlayerStatisticsResponseDto> =
      await apiClient.get(`${BASE_URL}/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch statistics";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to fetch statistics");
  }
}

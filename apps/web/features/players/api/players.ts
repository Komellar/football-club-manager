import { AxiosError, AxiosResponse } from "axios";
import { apiClient } from "@/lib/api-client";
import type {
  PlayerListDto,
  PaginatedPlayerListResponseDto,
  PlayerResponseDto,
  CreatePlayerDto,
  UpdatePlayerDto,
} from "@repo/core";
import { MAX_PAGE_SIZE, SortOrder } from "@repo/core";
import { cache } from "react";

const BASE_URL = "/players";

export async function getPlayers(
  params?: Partial<PlayerListDto>
): Promise<PaginatedPlayerListResponseDto> {
  try {
    const { data }: AxiosResponse<PaginatedPlayerListResponseDto> =
      await apiClient.get(BASE_URL, {
        params,
      });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch players";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to fetch players");
  }
}

/**
 * Fetches every player for pickers (contract and transfer forms) by walking
 * the pages, since the API caps each page at MAX_PAGE_SIZE.
 */
export async function getAllPlayers(): Promise<{ data: PlayerResponseDto[] }> {
  const data: PlayerResponseDto[] = [];
  for (let page = 1; ; page++) {
    const result = await getPlayers({
      page,
      limit: MAX_PAGE_SIZE,
      sort: { by: "name", order: SortOrder.ASC },
    });
    data.push(...result.data);
    if (!result.pagination.hasNext) return { data };
  }
}

export const getPlayerById = cache(
  async (id: number): Promise<PlayerResponseDto> => {
    try {
      const { data }: AxiosResponse<PlayerResponseDto> = await apiClient.get(
        `${BASE_URL}/${id}`
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch player";
        throw new Error(errorMessage);
      }
      throw new Error("Failed to fetch player");
    }
  }
);

export async function createPlayer(
  playerData: CreatePlayerDto
): Promise<PlayerResponseDto> {
  try {
    const { data }: AxiosResponse<PlayerResponseDto> = await apiClient.post(
      BASE_URL,
      playerData
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to create player";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to create player");
  }
}

export async function updatePlayer(
  id: number,
  playerData: UpdatePlayerDto
): Promise<PlayerResponseDto> {
  try {
    const { data }: AxiosResponse<PlayerResponseDto> = await apiClient.put(
      `${BASE_URL}/${id}`,
      playerData
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to update player";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to update player");
  }
}

export async function deletePlayer(id: number): Promise<void> {
  try {
    await apiClient.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete player";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to delete player");
  }
}

export async function getRandomMatchSquad(): Promise<PlayerResponseDto[]> {
  try {
    const { data }: AxiosResponse<PlayerResponseDto[]> = await apiClient.get(
      `${BASE_URL}/match-squad`
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch match squad";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to fetch match squad");
  }
}

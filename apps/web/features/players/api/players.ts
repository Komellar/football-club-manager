import { AxiosError, AxiosResponse } from "axios";
import { apiClient } from "@/lib/api-client";
import type {
  PlayerListDto,
  PaginatedPlayerListResponseDto,
  PlayerResponseDto,
  CreatePlayerDto,
} from "@repo/core";

export async function getPlayers(
  params?: Partial<PlayerListDto>
): Promise<PaginatedPlayerListResponseDto> {
  try {
    const { data }: AxiosResponse<PaginatedPlayerListResponseDto> =
      await apiClient.get("/players", {
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

export async function getPlayerById(id: number): Promise<PlayerResponseDto> {
  try {
    const { data }: AxiosResponse<PlayerResponseDto> = await apiClient.get(
      `/players/${id}`
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

export async function createPlayer(
  playerData: CreatePlayerDto
): Promise<PlayerResponseDto> {
  try {
    const { data }: AxiosResponse<PlayerResponseDto> = await apiClient.post(
      "/players",
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
  playerData: CreatePlayerDto
): Promise<PlayerResponseDto> {
  try {
    const { data }: AxiosResponse<PlayerResponseDto> = await apiClient.patch(
      `/players/${id}`,
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
    await apiClient.delete(`/players/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete player";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to delete player");
  }
}

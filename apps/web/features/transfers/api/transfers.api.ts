"use server";

import { AxiosError, AxiosResponse } from "axios";
import { apiClient } from "@/lib/api-client";
import type {
  TransferListDto,
  PaginatedTransferResponseDto,
  TransferResponseDto,
  CreateTransferDto,
  UpdateTransferDto,
} from "@repo/core";

export async function getTransfers(
  params?: TransferListDto
): Promise<PaginatedTransferResponseDto> {
  try {
    const { data }: AxiosResponse<PaginatedTransferResponseDto> =
      await apiClient.get("/transfers", { params });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch transfers";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to fetch transfers");
  }
}

export async function getTransferById(
  id: number
): Promise<TransferResponseDto> {
  try {
    const { data }: AxiosResponse<TransferResponseDto> =
      await apiClient.get(`/transfers/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch transfer";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to fetch transfer");
  }
}

export async function createTransfer(
  transferData: CreateTransferDto
): Promise<TransferResponseDto> {
  try {
    const { data }: AxiosResponse<TransferResponseDto> =
      await apiClient.post("/transfers", transferData);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to create transfer";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to create transfer");
  }
}

export async function updateTransfer(
  id: number,
  transferData: UpdateTransferDto
): Promise<TransferResponseDto> {
  try {
    const { data }: AxiosResponse<TransferResponseDto> =
      await apiClient.patch(`/transfers/${id}`, transferData);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to update transfer";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to update transfer");
  }
}

export async function deleteTransfer(id: number): Promise<void> {
  try {
    await apiClient.delete(`/transfers/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete transfer";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to delete transfer");
  }
}

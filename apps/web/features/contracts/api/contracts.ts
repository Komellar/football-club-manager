import { AxiosError, AxiosResponse } from "axios";
import { apiClient } from "@/lib/api-client";
import type {
  ContractListDto,
  PaginatedContractListResponseDto,
  ContractResponseDto,
  CreateContractDto,
  UpdateContractDto,
  ContractRenewalDto,
  ContractNewRenewalDto,
  ContractFinancialSummary,
  ContractValueCalculation,
} from "@repo/core";

export async function getContracts(
  params?: Partial<ContractListDto>
): Promise<PaginatedContractListResponseDto> {
  try {
    const { data }: AxiosResponse<PaginatedContractListResponseDto> =
      await apiClient.get("/contracts", {
        params,
      });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch contracts";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to fetch contracts");
  }
}

export async function getContractById(
  id: number
): Promise<ContractResponseDto> {
  try {
    const { data }: AxiosResponse<ContractResponseDto> = await apiClient.get(
      `/contracts/${id}`
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch contract";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to fetch contract");
  }
}

export async function createContract(
  contractData: CreateContractDto
): Promise<ContractResponseDto> {
  try {
    const { data }: AxiosResponse<ContractResponseDto> = await apiClient.post(
      "/contracts",
      contractData
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to create contract";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to create contract");
  }
}

export async function updateContract(
  id: number,
  contractData: UpdateContractDto
): Promise<ContractResponseDto> {
  try {
    const { data }: AxiosResponse<ContractResponseDto> = await apiClient.patch(
      `/contracts/${id}`,
      contractData
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to update contract";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to update contract");
  }
}

export async function deleteContract(id: number): Promise<void> {
  try {
    await apiClient.delete(`/contracts/${id}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete contract";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to delete contract");
  }
}

export async function renewContract(
  id: number,
  renewalData: ContractRenewalDto
): Promise<ContractResponseDto> {
  try {
    const { data }: AxiosResponse<ContractResponseDto> = await apiClient.patch(
      `/contracts/${id}/renew`,
      renewalData
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to renew contract";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to renew contract");
  }
}

export async function createRenewalContract(
  id: number,
  renewalData: ContractNewRenewalDto
): Promise<ContractResponseDto> {
  try {
    const { data }: AxiosResponse<ContractResponseDto> = await apiClient.post(
      `/contracts/${id}/renew`,
      renewalData
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to create renewal contract";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to create renewal contract");
  }
}

export async function getFinancialSummary(): Promise<ContractFinancialSummary> {
  try {
    const { data }: AxiosResponse<ContractFinancialSummary> =
      await apiClient.get("/contracts/financial/summary");
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch financial summary";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to fetch financial summary");
  }
}

export async function getContractValueCalculation(
  id: number
): Promise<ContractValueCalculation> {
  try {
    const { data }: AxiosResponse<ContractValueCalculation> =
      await apiClient.get(`/contracts/financial/${id}/value-calculation`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch contract value calculation";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to fetch contract value calculation");
  }
}

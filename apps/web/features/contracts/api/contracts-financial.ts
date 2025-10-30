import { AxiosError, AxiosResponse } from "axios";
import { apiClient } from "@/lib/api-client";
import type { ContractFinancialSummary } from "@repo/core";

export async function getFinancialSummaryServer(): Promise<ContractFinancialSummary> {
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

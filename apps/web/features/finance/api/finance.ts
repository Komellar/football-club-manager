import { apiClient } from "@/lib/api-client";
import { FinancialSummary } from "@repo/core";

export async function getFinancialSummary(
  startDate: string,
  endDate: string
): Promise<FinancialSummary> {
  const response = await apiClient.get<FinancialSummary>("/finance/summary", {
    params: {
      startDate,
      endDate,
    },
  });
  return response.data;
}

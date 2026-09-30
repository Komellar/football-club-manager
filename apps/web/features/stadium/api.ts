import { apiClient } from "@/lib/api-client";
import type { StadiumSettings } from "@repo/core";

export const stadiumApi = {
  get: async () =>
    (await apiClient.get<StadiumSettings | null>("/stadium")).data,
  save: async (data: StadiumSettings) =>
    (await apiClient.put<StadiumSettings>("/stadium", data)).data,
};

import { apiClient } from "@/lib/api-client";
import { AxiosError } from "axios";
import type {
  CreateFixtureDto,
  UpdateFixtureDto,
  FixtureDto,
} from "@repo/core";

export const fixturesApi = {
  list: async () => (await apiClient.get<FixtureDto[]>("/fixtures")).data,
  get: async (id: string) =>
    (await apiClient.get<FixtureDto>(`/fixtures/${id}`)).data,
  create: async (data: CreateFixtureDto) =>
    (await apiClient.post<FixtureDto>("/fixtures", data)).data,
  update: async (id: string, data: UpdateFixtureDto) =>
    (await apiClient.patch<FixtureDto>(`/fixtures/${id}`, data)).data,
  cancel: async (id: string) =>
    (await apiClient.post<FixtureDto>(`/fixtures/${id}/cancel`)).data,
};
export function fixtureError(error: unknown): string {
  if (
    error instanceof AxiosError &&
    typeof error.response?.data?.message === "string"
  )
    return error.response.data.message;
  return error instanceof Error ? error.message : "Could not save fixture";
}
export function localDateTime(iso: string) {
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

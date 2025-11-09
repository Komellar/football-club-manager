import { PlayerStatisticsResponseDto } from "@repo/core";

export type PureStats = Omit<
  PlayerStatisticsResponseDto,
  "id" | "playerId" | "createdAt" | "updatedAt"
>;

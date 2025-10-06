import { PlayerPosition } from "@repo/core";

export const positionColors = {
  [PlayerPosition.GOALKEEPER]: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  [PlayerPosition.DEFENDER]: "bg-green-100 text-green-800 hover:bg-green-200",
  [PlayerPosition.MIDFIELDER]:
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  [PlayerPosition.FORWARD]: "bg-red-100 text-red-800 hover:bg-red-200",
} as const;

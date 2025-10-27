import { PlayerPosition } from "@repo/core";

export const formatPlayerPosition = (position: PlayerPosition) => {
  return position.charAt(0).toUpperCase() + position.slice(1).toLowerCase();
};

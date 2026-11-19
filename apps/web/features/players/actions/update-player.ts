"use server";

import { revalidatePath } from "next/cache";
import { updatePlayer } from "../api/players";
import type { UpdatePlayerDto } from "@repo/core";

export async function updatePlayerAction(
  playerId: number,
  playerData: UpdatePlayerDto
) {
  if (!playerData.isActive) {
    delete playerData.jerseyNumber;
  }

  await updatePlayer(playerId, playerData);

  revalidatePath("/players");
  revalidatePath(`/players/${playerId}`);
}

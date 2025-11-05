"use server";

import { revalidatePath } from "next/cache";
import { updatePlayer } from "../api/players";
import type { CreatePlayerDto } from "@repo/core";

export async function updatePlayerAction(
  playerId: number,
  playerData: CreatePlayerDto
) {
  if (!playerData.isActive) {
    delete playerData.jerseyNumber;
  }

  await updatePlayer(playerId, playerData);

  revalidatePath("/players");
  revalidatePath(`/players/${playerId}`);
}

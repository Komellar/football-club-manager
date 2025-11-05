"use server";

import { revalidatePath } from "next/cache";
import { createPlayer } from "../api/players";
import type { CreatePlayerDto } from "@repo/core";

export async function createPlayerAction(playerData: CreatePlayerDto) {
  if (!playerData.isActive) {
    delete playerData.jerseyNumber;
  }

  const result = await createPlayer(playerData);

  revalidatePath("/players");
  return result;
}

"use server";

import { revalidatePath } from "next/cache";
import { createPlayer } from "../api/players";
import type { CreatePlayerDto } from "@repo/core";

export async function createPlayerAction(playerData: CreatePlayerDto) {
  await createPlayer(playerData);

  revalidatePath("/players");
}

"use server";

import { revalidatePath } from "next/cache";
import { deletePlayer } from "../api/players";

export async function deletePlayerAction(playerId: number) {
  await deletePlayer(playerId);
  revalidatePath("/players");
}

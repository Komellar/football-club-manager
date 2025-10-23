"use server";

import { revalidatePath } from "next/cache";
import { deletePlayer } from "../api/players";

export async function deletePlayerAction(playerId: number) {
  console.log("Deleting player with ID:", playerId);
  await deletePlayer(playerId);
  revalidatePath("/players");
}

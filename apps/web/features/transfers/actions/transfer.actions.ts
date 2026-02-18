"use server";

import { revalidatePath } from "next/cache";
import { createTransfer, updateTransfer, deleteTransfer } from "../api";
import type { CreateTransferDto, UpdateTransferDto } from "@repo/core";

export async function createTransferAction(data: CreateTransferDto) {
  const result = await createTransfer(data);
  revalidatePath("/transfers");
  return result;
}

export async function updateTransferAction(
  id: number,
  data: UpdateTransferDto,
) {
  await updateTransfer(id, data);
  revalidatePath("/transfers");
}

export async function deleteTransferAction(transferId: number) {
  await deleteTransfer(transferId);
  revalidatePath("/transfers");
}

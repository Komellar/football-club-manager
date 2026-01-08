"use server";

import { createTransfer, updateTransfer } from "../api";
import type { CreateTransferDto, UpdateTransferDto } from "@repo/core";

export async function createTransferAction(data: CreateTransferDto) {
  return await createTransfer(data);
}

export async function updateTransferAction(
  id: number,
  data: UpdateTransferDto
) {
  return await updateTransfer(id, data);
}

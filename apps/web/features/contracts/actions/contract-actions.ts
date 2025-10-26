"use server";

import { revalidatePath } from "next/cache";
import {
  createContract,
  deleteContract,
  updateContract,
} from "../api/contracts";
import { CreateContractDto, UpdateContractDto } from "@repo/core";

export async function createContractAction(data: CreateContractDto) {
  const result = await createContract(data);
  revalidatePath("/contracts");
  return result;
}

export async function updateContractAction(
  id: number,
  data: UpdateContractDto
) {
  const result = await updateContract(id, data);
  revalidatePath("/contracts");
  revalidatePath(`/contracts/${id}`);
  return result;
}

export async function deleteContractAction(id: number) {
  await deleteContract(id);
  revalidatePath("/contracts");
}

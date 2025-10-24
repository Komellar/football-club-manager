"use server";

import { revalidatePath } from "next/cache";
import type { CreateContract } from "@repo/core";
import { createContract } from "../api";

export async function createContractAction(contractData: CreateContract) {
  const result = await createContract(contractData);

  revalidatePath("/contracts");
  return result;
}

import { getExpiringContracts } from "@/features/contracts/api";
import { ExpiringContracts } from "./expiring-contracts";
import { getCriticalContracts } from "../../utils";

interface ExpiringContractsServerProps {
  days?: number;
}

export async function ExpiringContractsServer({
  days = 30,
}: ExpiringContractsServerProps) {
  const expiringContracts = await getExpiringContracts({ days });

  const criticalContracts = getCriticalContracts(expiringContracts);

  return (
    <ExpiringContracts
      expiringContracts={expiringContracts}
      criticalContracts={criticalContracts}
      days={days}
    />
  );
}

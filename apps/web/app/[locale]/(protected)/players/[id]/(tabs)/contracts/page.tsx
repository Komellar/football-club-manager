import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getContracts } from "@/features/contracts/api";
import {
  ActiveContract,
  ContractsHistory,
} from "@/features/players/components/tabs/player-contract";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ContractStatus } from "@repo/core";

export default async function PlayerContractsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const playerId = Number(id);

  const tC = await getTranslations("Contracts");
  const t = await getTranslations("Players");

  const { data: contracts } = await getContracts({ where: { playerId } });

  const activeContract = contracts.find(
    (c) => c.status === ContractStatus.ACTIVE
  );

  return (
    <div className="space-y-6">
      {activeContract ? (
        <ActiveContract contract={activeContract} />
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              {t("noActiveContract")}
            </p>
            <Link href={`/contracts/new?playerId=${playerId}`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {tC("createContract")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {contracts.length > 1 && <ContractsHistory contracts={contracts} />}
    </div>
  );
}

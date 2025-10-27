import { getContracts } from "@/features/contracts/api/contracts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from "next-intl/server";
import { ContractStatus } from "@repo/core";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ActiveContract, ContractsHistory } from "./chunks";

interface PlayerContractsTabProps {
  playerId: number;
}

export async function PlayerContractsTab({
  playerId,
}: PlayerContractsTabProps) {
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

export function PlayerContractsTabSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

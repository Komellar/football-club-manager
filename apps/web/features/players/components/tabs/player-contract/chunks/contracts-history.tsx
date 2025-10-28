import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContractResponseDto, ContractStatus } from "@repo/core";
import { formatCurrency } from "@/utils/currency";
import {
  contractStatusColors,
  contractTypeColors,
} from "@/features/contracts/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { dateToString } from "@/utils/date";

interface ContractsHistoryProps {
  contracts: ContractResponseDto[];
}

export async function ContractsHistory({ contracts }: ContractsHistoryProps) {
  const t = await getTranslations("Players");
  const tc = await getTranslations("Contracts");

  const historicalContracts = contracts
    .filter((c) => c.status !== ContractStatus.ACTIVE)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {t("contractHistory")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {historicalContracts.map((contract) => (
            <div
              key={contract.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Badge
                  variant="secondary"
                  className={contractTypeColors[contract.contractType]}
                >
                  {tc(`types.${contract.contractType}`)}
                </Badge>
                <div className="text-sm">
                  <p className="font-medium">
                    {dateToString(contract.startDate)} -{" "}
                    {dateToString(contract.endDate)}
                  </p>
                  <p className="text-muted-foreground">
                    {formatCurrency(contract.salary)} / {tc("months")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={contractStatusColors[contract.status]}
                >
                  {tc(`statuses.${contract.status}`)}
                </Badge>
                <Link href={`/contracts/${contract.id}`}>
                  <Button variant="ghost" size="sm">
                    {tc("view")}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

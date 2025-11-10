import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";
import { differenceInDays } from "date-fns";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ContractResponseDto } from "@repo/core";
import {
  contractStatusColors,
  contractTypeColors,
} from "@/features/contracts/constants";
import { dateToString } from "@/utils/date";

interface ActiveContractProps {
  contract: ContractResponseDto;
}

export async function ActiveContract({ contract }: ActiveContractProps) {
  const t = await getTranslations("Players");
  const tc = await getTranslations("Contracts");

  const isExpiringSoon = (endDate: Date | string): boolean => {
    const days = differenceInDays(new Date(endDate), new Date());
    return days > 0 && days <= 90;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t("activeContract")}
          </CardTitle>
          <Link href={`/contracts/${contract.id}`}>
            <Button variant="outline" size="sm">
              {tc("view")}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">
              {tc("contractType")}
            </label>
            <div className="mt-1">
              <Badge
                variant="secondary"
                className={contractTypeColors[contract.contractType]}
              >
                {tc(`types.${contract.contractType}`)}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              {tc("status")}
            </label>
            <div className="mt-1">
              <Badge
                variant="secondary"
                className={contractStatusColors[contract.status]}
              >
                {tc(`statuses.${contract.status}`)}
              </Badge>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
            <div>
              <label className="text-sm text-muted-foreground">
                {tc("startDate")}
              </label>
              <p className="text-sm font-medium">
                {dateToString(contract.startDate)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
            <div>
              <label className="text-sm text-muted-foreground">
                {tc("endDate")}
              </label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">
                  {dateToString(contract.endDate)}
                </p>
                {isExpiringSoon(contract.endDate) && (
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                )}
              </div>
              {isExpiringSoon(contract.endDate) && (
                <p className="text-xs text-yellow-600 mt-1">
                  {tc("expiringSoon")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 mt-1 text-muted-foreground" />
            <div>
              <label className="text-sm text-muted-foreground">
                {tc("salary")}
              </label>
              <p className="text-sm font-medium">
                {formatCurrency(contract.salary)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 mt-1 text-muted-foreground" />
            <div>
              <label className="text-sm text-muted-foreground">
                {tc("bonuses")}
              </label>
              <p className="text-sm font-medium">
                {formatCurrency(contract.bonuses)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 md:col-span-2">
            <DollarSign className="w-4 h-4 mt-1 text-muted-foreground" />
            <div>
              <label className="text-sm text-muted-foreground">
                {tc("releaseClause")}
              </label>
              <p className="text-sm font-medium">
                {formatCurrency(contract.releaseClause)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

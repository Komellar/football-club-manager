"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractsTable } from "./contracts-table";
import { PaginatedContractListResponseDto } from "@repo/core";

interface ContractsClientProps {
  data: PaginatedContractListResponseDto;
}

export function Contracts({ data }: ContractsClientProps) {
  const t = useTranslations("Contracts");

  return (
    <div className="space-y-6">
      <Card>
        {data.data.length ? (
          <CardHeader>
            <CardTitle>{t("contractList")}</CardTitle>
          </CardHeader>
        ) : null}
        <CardContent>
          <ContractsTable contractsData={data} />
        </CardContent>
      </Card>
    </div>
  );
}

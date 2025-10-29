import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractsTable } from "./contracts-table";
import { PaginatedContractListResponseDto } from "@repo/core";
import { getTranslations } from "next-intl/server";

interface ContractsClientProps {
  data: PaginatedContractListResponseDto;
}

export async function Contracts({ data }: ContractsClientProps) {
  const t = await getTranslations("Contracts");

  return (
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
  );
}

"use client";

import {
  ContractSortColumn,
  PaginatedContractListResponseDto,
  SortOrder,
} from "@repo/core";
import { DataTable } from "@/components/shared/data-table/data-table";
import { createContractColumns } from "./columns";
import { TablePagination } from "@/components/shared/data-table/table-pagination";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTableSort } from "@/hooks";

interface ContractsListProps {
  contractsData: PaginatedContractListResponseDto;
}

export function ContractsTable({ contractsData }: ContractsListProps) {
  const t = useTranslations("Contracts");
  const { data: contracts, pagination } = contractsData;

  const sortHook = useTableSort<ContractSortColumn>({
    defaultSort: { by: "createdAt", order: SortOrder.DESC },
  });

  const columns = createContractColumns(sortHook);

  if (contracts.length === 0) {
    return (
      <div className="text-center p-10">
        <p className="text-muted-foreground mb-4">{t("noContractsMessage")}</p>
        <Button asChild>
          <Link href="/contracts/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("createContract")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={contracts}
        noResultsMessage={t("noContractsFound")}
      />
      <TablePagination pagination={pagination} />
    </div>
  );
}

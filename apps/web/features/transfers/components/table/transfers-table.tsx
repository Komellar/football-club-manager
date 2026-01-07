"use client";

import {
  PaginatedTransferResponseDto,
  SortOrder,
  TransferSortColumn,
} from "@repo/core";
import { DataTable } from "@/components/shared/data-table/data-table";
import { createTransferColumns } from "./columns";
import { TablePagination } from "@/components/shared/data-table/table-pagination";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTableSort } from "@/hooks";
import { TableSearchInput } from "@/components/shared/data-table/table-search-input";
import { TransfersFilterDrawer } from "./transfers-filter-drawer";

interface TransfersTableProps {
  transfersData: PaginatedTransferResponseDto;
}

export function TransfersTable({ transfersData }: TransfersTableProps) {
  const t = useTranslations("Transfers");
  const { data: transfers, pagination } = transfersData;

  const sortHook = useTableSort<TransferSortColumn>({
    defaultSort: { by: "createdAt", order: SortOrder.DESC },
  });

  const columns = createTransferColumns(sortHook);

  if (transfers.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <TransfersFilterDrawer />
          <TableSearchInput placeholder={t("placeholders.searchByClub")} />
        </div>
        <div className="text-center p-10">
          <p className="text-muted-foreground mb-4">
            {t("noTransfersMessage")}
          </p>
          <Button asChild>
            <Link href="/transfers/new">
              <Plus className="h-4 w-4 mr-2" />
              {t("addTransfer")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <TransfersFilterDrawer />
        <TableSearchInput placeholder={t("placeholders.searchByClub")} />
      </div>
      <DataTable
        columns={columns}
        data={transfers}
        noResultsMessage={t("noTransfersFound")}
      />
      <TablePagination pagination={pagination} />
    </div>
  );
}

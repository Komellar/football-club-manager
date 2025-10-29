"use client";

import {
  PaginatedPlayerListResponseDto,
  PlayerSortColumn,
  SortOrder,
} from "@repo/core";
import { DataTable } from "@/components/shared/data-table/data-table";
import { createPlayerColumns } from "./columns";
import { TablePagination } from "@/components/shared/data-table/table-pagination";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTableSort } from "@/hooks";
import { PlayersFilterDrawer } from "./players-filter-drawer";

interface PlayersListProps {
  playersData: PaginatedPlayerListResponseDto;
}

export function PlayersTable({ playersData }: PlayersListProps) {
  const t = useTranslations("Players");
  const { data: players, pagination } = playersData;

  const sortHook = useTableSort<PlayerSortColumn>({
    defaultSort: { by: "createdAt", order: SortOrder.ASC },
  });

  const columns = createPlayerColumns(sortHook);

  if (players.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <PlayersFilterDrawer />
        </div>
        <div className="text-center p-10">
          <p className="text-muted-foreground mb-4">{t("noPlayersMessage")}</p>
          <Button asChild>
            <Link href="/players/new">
              <Plus className="h-4 w-4 mr-2" />
              {t("addPlayer")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PlayersFilterDrawer />
      </div>
      <DataTable
        columns={columns}
        data={players}
        noResultsMessage={t("noPlayersFound")}
      />
      <TablePagination pagination={pagination} />
    </div>
  );
}

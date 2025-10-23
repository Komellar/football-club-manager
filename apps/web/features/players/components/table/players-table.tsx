"use client";

import {
  PaginatedPlayerListResponseDto,
  PlayerSortColumn,
  SortOrder,
} from "@repo/core";
import { DataTable } from "@/components/shared/data-table/data-table";
import { createPlayerColumns } from "./columns";
import { TablePagination } from "@/components/shared/data-table/table-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTableSort } from "@/hooks";

interface PlayersListProps {
  playersData: PaginatedPlayerListResponseDto;
}

export function PlayersTable({ playersData }: PlayersListProps) {
  const t = useTranslations("Players");
  const { data: players, pagination } = playersData;

  const sortHook = useTableSort<PlayerSortColumn>({
    defaultSort: { by: "name", order: SortOrder.ASC },
  });

  const columns = createPlayerColumns(sortHook);

  if (players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("noPlayersFound")}</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">{t("noPlayersMessage")}</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("addPlayer")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={players}
        noResultsMessage={t("noPlayersFound")}
      />
      <TablePagination pagination={pagination} />
    </div>
  );
}

"use client";

import { PaginatedPlayerListResponseDto, PlayerSortColumn } from "@repo/core";
import { DataTable } from "@/components/shared/data-table/data-table";
import { createPlayerColumns } from "./columns";
import { PlayersPagination } from "./players-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { UseTableSortReturn } from "@/hooks";

interface PlayersListProps {
  playersData: PaginatedPlayerListResponseDto;
  sortHook: UseTableSortReturn<PlayerSortColumn>;
}

export function PlayersTable({ playersData, sortHook }: PlayersListProps) {
  const t = useTranslations("Players");
  const { data: players, pagination } = playersData;

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
      <PlayersPagination pagination={pagination} />
    </div>
  );
}

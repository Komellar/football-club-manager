"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayersTable } from "@/features/players/components";
import { PlayersFilterDrawer } from "./players-filter-drawer";
import { useTableFilters } from "@/hooks";
import {
  PlayerListFiltersSchema,
  PaginatedPlayerListResponseDto,
} from "@repo/core";

interface PlayersClientProps {
  data: PaginatedPlayerListResponseDto;
}

export function Players({ data }: PlayersClientProps) {
  const t = useTranslations("Players");

  const filterHook = useTableFilters({
    schema: PlayerListFiltersSchema,
  });

  return (
    <div className="space-y-6">
      <PlayersFilterDrawer filterHook={filterHook} />
      <Card>
        <CardHeader>
          <CardTitle>{t("playerList")}</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayersTable playersData={data} />
        </CardContent>
      </Card>
    </div>
  );
}

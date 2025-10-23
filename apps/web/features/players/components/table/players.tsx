"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayersTable } from "@/features/players/components";
import { PlayersFilterDrawer } from "./players-filter-drawer";
import { PaginatedPlayerListResponseDto } from "@repo/core";

interface PlayersClientProps {
  data: PaginatedPlayerListResponseDto;
}

export function Players({ data }: PlayersClientProps) {
  const t = useTranslations("Players");

  return (
    <div className="space-y-6">
      <PlayersFilterDrawer />
      <Card>
        {data.data.length ? (
          <CardHeader>
            <CardTitle>{t("playerList")}</CardTitle>
          </CardHeader>
        ) : null}
        <CardContent>
          <PlayersTable playersData={data} />
        </CardContent>
      </Card>
    </div>
  );
}

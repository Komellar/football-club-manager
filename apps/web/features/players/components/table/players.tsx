"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayersTable } from "@/features/players/components";
import { PaginatedPlayerListResponseDto } from "@repo/core";

interface PlayersClientProps {
  data: PaginatedPlayerListResponseDto;
}

export function Players({ data }: PlayersClientProps) {
  const t = useTranslations("Players");

  return (
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
  );
}

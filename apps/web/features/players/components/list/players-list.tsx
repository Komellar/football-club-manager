import { PaginatedPlayerListResponseDto } from "@repo/core";
import { PlayersTable } from "./players-table";
import { PlayersPagination } from "./players-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface PlayersListProps {
  playersData: PaginatedPlayerListResponseDto;
}

export async function PlayersList({ playersData }: PlayersListProps) {
  const { data: players, pagination } = playersData;
  const t = await getTranslations("Players");

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
      <PlayersTable players={players} />
      <PlayersPagination pagination={pagination} />
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PlayersList } from "@/features/players/components";
import { getPlayers } from "@/features/players/api";
import { getTranslations } from "next-intl/server";

// Force this page to be dynamic since it fetches authenticated data
export const dynamic = "force-dynamic";

export default async function PlayersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Players");
  const players = await getPlayers({
    page: 1,
    limit: 10,
    sortBy: "name",
    sortOrder: "ASC",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("managePlayers")}</p>
        </div>
        <Link href={`/${locale}/dashboard/players/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("addPlayer")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("playerList")}</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayersList playersData={players} />
        </CardContent>
      </Card>
    </div>
  );
}

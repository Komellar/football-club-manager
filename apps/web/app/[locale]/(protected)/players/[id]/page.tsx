import { PlayerDetails } from "@/features/players/components/player-details";
import { getPlayerById } from "@/features/players/api/players";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DeletePlayerDialog } from "@/features/players/components/delete-player-dialog";

export default async function PlayerDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("Players");

  const playerId = parseInt(id, 10);
  if (isNaN(playerId)) {
    notFound();
  }

  let player;
  try {
    player = await getPlayerById(playerId);
  } catch (error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/players`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("playerDetails")}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/${locale}/players/${player.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              {t("edit")}
            </Button>
          </Link>
          <DeletePlayerDialog
            playerId={player.id}
            playerName={player.name}
            redirectPath={`/${locale}/players`}
          />
        </div>
      </div>

      <PlayerDetails player={player} />
    </div>
  );
}

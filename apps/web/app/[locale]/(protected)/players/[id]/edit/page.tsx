import { EditPlayerForm } from "@/features/players/components";
import { getPlayerById } from "@/features/players/api/players";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function EditPlayerPage({
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
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/players`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("editPlayer")}
          </h1>
          <p className="text-muted-foreground">
            {t("updatePlayerProfile", { name: player.name })}
          </p>
        </div>
      </div>

      <EditPlayerForm player={player} />
    </div>
  );
}

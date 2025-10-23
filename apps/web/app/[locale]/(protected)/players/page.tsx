import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Players } from "@/features/players/components/table/players";
import { getPlayers } from "@/features/players/api";
import { getTranslations } from "next-intl/server";
import { PlayerListSchema } from "@repo/core";
import { parseSearchParams } from "@/utils/searchParams";

// Force this page to be dynamic since it fetches authenticated data
export const dynamic = "force-dynamic";

// Accept searchParams for SSR hydration
export default async function PlayersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Players");

  const resolvedSearchParams = await searchParams;
  const parsed = parseSearchParams(resolvedSearchParams);

  const validatedParams = PlayerListSchema.parse(parsed);

  const players = await getPlayers(validatedParams);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("managePlayers")}</p>
        </div>
        <Link href={`/${locale}/players/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("addPlayer")}
          </Button>
        </Link>
      </div>

      <Players data={players} />
    </div>
  );
}

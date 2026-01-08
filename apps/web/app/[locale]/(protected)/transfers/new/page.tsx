import { TransferForm } from "@/features/transfers/components";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getPlayers } from "@/features/players/api";

export default async function NewTransferPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Transfers");

  // Fetch all players for the dropdown
  const playersData = await getPlayers({ limit: 0 });
  const players = playersData.data.map((player) => ({
    id: player.id,
    name: player.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/transfers`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("addTransfer")}
          </h1>
          <p className="text-muted-foreground">
            {t("createTransferDescription")}
          </p>
        </div>
      </div>

      <TransferForm players={players} />
    </div>
  );
}

import { EditTransferForm } from "@/features/transfers/components/form/edit-transfer-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getPlayers } from "@/features/players/api";
import { getTransferById } from "@/features/transfers/api";
import { notFound } from "next/navigation";

export default async function EditTransferPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("Transfers");

  // Fetch the transfer to edit
  const transfer = await getTransferById(Number(id));
  
  if (!transfer) {
    notFound();
  }

  // Fetch all players for the dropdown
  const playersData = await getPlayers({ limit: 0 });
  const players = playersData.data.map((player) => ({
    id: player.id,
    name: player.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/transfers/${id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("editTransfer")}
          </h1>
          <p className="text-muted-foreground">
            {t("editTransferDescription")}
          </p>
        </div>
      </div>

      <EditTransferForm transfer={transfer} players={players} />
    </div>
  );
}

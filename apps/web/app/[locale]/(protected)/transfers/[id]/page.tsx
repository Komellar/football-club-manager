import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransferDetails, DeleteTransferDialog } from "@/features/transfers/components";
import { getTransferById } from "@/features/transfers/api";

interface TransferDetailsPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function TransferDetailsPage({
  params,
}: TransferDetailsPageProps) {
  const { locale, id } = await params;
  const transferId = Number(id);

  if (isNaN(transferId)) {
    notFound();
  }

  const t = await getTranslations("Transfers");

  const transfer = await getTransferById(transferId);

  if (!transfer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/transfers`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("transferDetails")}
            </h1>
            {transfer.player && (
              <p className="text-muted-foreground">
                {t("transferFor", { player: transfer.player.name })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/${locale}/transfers/${transferId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              {t("edit")}
            </Button>
          </Link>
          <DeleteTransferDialog
            transferId={transferId}
            playerName={transfer.player?.name || `Player #${transfer.playerId}`}
            redirectPath={`/${locale}/transfers`}
          />
        </div>
      </div>

      <TransferDetails transfer={transfer} />
    </div>
  );
}

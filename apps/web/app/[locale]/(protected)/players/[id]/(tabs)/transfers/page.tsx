import { getPlayerTransferHistory } from "@/features/transfers/api";
import { PlayerTransferHistory } from "@/features/players/components/transfer-history";

interface PlayerTransfersPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function PlayerTransfersPage({
  params,
}: PlayerTransfersPageProps) {
  const { locale, id } = await params;
  const playerId = Number(id);

  const transferHistory = await getPlayerTransferHistory(playerId);

  return (
    <PlayerTransferHistory transferHistory={transferHistory} locale={locale} />
  );
}

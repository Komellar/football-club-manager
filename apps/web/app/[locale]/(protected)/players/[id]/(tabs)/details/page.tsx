import { getPlayerById } from "@/features/players/api/players";
import {
  AdditionalInfo,
  Avatar,
  Physical,
  TeamInfo,
} from "@/features/players/components/tabs";

export default async function PlayerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const playerId = Number(id);
  const player = await getPlayerById(playerId);

  return (
    <div className="space-y-6">
      <Avatar player={player} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Physical player={player} />
        <TeamInfo player={player} />
      </div>
      <AdditionalInfo player={player} />
    </div>
  );
}

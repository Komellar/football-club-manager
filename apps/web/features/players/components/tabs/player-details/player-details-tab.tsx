import { PlayerResponseDto } from "@repo/core";
import { Avatar, AdditionalInfo, Physical, TeamInfo } from "./chunks";

interface PlayerDetailsProps {
  player: PlayerResponseDto;
}

export async function PlayerDetailsTab({ player }: PlayerDetailsProps) {
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

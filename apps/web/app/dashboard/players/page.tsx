import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PlayersList } from "@/features/players/components";
import { getPlayers } from "@/features/players/api";

export default async function PlayersPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Players</h1>
          <p className="text-muted-foreground">
            Manage your club&apos;s player list
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Player
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Player list</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayersList playersData={players} />
        </CardContent>
      </Card>
    </div>
  );
}

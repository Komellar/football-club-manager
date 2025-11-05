"use client";

import type { MatchEventPlayer, StartMatch } from "@repo/core";
import { matchEventsSocket } from "../services/match-events-socket.service";
import { getRandomMatchSquad } from "@/features/players/api";

export const startMatch = async () => {
  const players = await getRandomMatchSquad();

  const myClubPlayers: MatchEventPlayer[] = players.map((player) => ({
    id: player.id,
    name: player.name,
    jerseyNumber: player.jerseyNumber ?? undefined,
  }));

  const matchId = Date.now();

  const matchData: StartMatch = {
    matchId,
    homeTeam: {
      id: 1,
      name: "My Club",
      players: myClubPlayers,
    },
    awayTeam: {
      id: 2,
      name: "Opponent Team",
    },
  };

  // Subscribe to match and start simulation
  matchEventsSocket.subscribeToMatch(matchData.matchId);
  matchEventsSocket.startMatch(matchData);
};

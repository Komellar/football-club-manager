"use client";

import type { MatchEventPlayer, StartMatch } from "@repo/core";
import { matchEventsSocket } from "../services/match-events-socket.service";

export const startMatch = async (players: MatchEventPlayer[]) => {
  const matchData: StartMatch = {
    homeTeam: {
      id: 1,
      name: "My Club",
      players,
    },
    awayTeam: {
      id: 2,
      name: "Opponent Team",
    },
  };

  // Subscribe to match and start simulation
  await matchEventsSocket.subscribeToMatch();
  await matchEventsSocket.startMatch(matchData);
};

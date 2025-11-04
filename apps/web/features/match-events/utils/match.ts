import type { MatchEventPlayer, StartMatch } from "@repo/core";
import { matchEventsSocket } from "../services/match-events-socket.service";

export const startMatch = () => {
  const manchesterUnitedPlayers: MatchEventPlayer[] = [
    { id: 1, name: "Bruno Fernandes", jerseyNumber: 8 },
    { id: 2, name: "Marcus Rashford", jerseyNumber: 10 },
    { id: 3, name: "Casemiro", jerseyNumber: 18 },
    { id: 4, name: "Lisandro Martinez", jerseyNumber: 6 },
    { id: 5, name: "Diogo Dalot", jerseyNumber: 20 },
    { id: 6, name: "Luke Shaw", jerseyNumber: 23 },
    { id: 7, name: "Harry Maguire", jerseyNumber: 5 },
    { id: 8, name: "Antony", jerseyNumber: 21 },
    { id: 9, name: "Christian Eriksen", jerseyNumber: 14 },
    { id: 10, name: "Rasmus Højlund", jerseyNumber: 11 },
    { id: 11, name: "André Onana", jerseyNumber: 24 },
  ];

  const matchId = Date.now();

  const matchData: StartMatch = {
    matchId,
    homeTeam: {
      id: 1,
      name: "Manchester United",
      players: manchesterUnitedPlayers,
    },
    awayTeam: {
      id: 2,
      name: "Arsenal FC",
    },
  };

  // Subscribe to match and start simulation
  matchEventsSocket.subscribeToMatch(matchData.matchId);
  matchEventsSocket.startMatch(matchData);
};

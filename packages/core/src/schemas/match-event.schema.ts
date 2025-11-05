import { z } from "zod";
import { MatchEventType } from "../enums/match-event-type.enum";

const ScoreSchema = z.object({
  home: z.number().int().min(0),
  away: z.number().int().min(0),
});

export const MatchEventPlayerSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  jerseyNumber: z.number().int().min(1).max(99).optional(),
});

export const MatchEventSchema = z.object({
  id: z.uuid(),
  matchId: z.number().int().positive(),
  type: z.enum(MatchEventType),
  minute: z.number().int().min(0).max(120), // Regular time + extra time
  timestamp: z.date(),
  teamId: z.number().int().positive(),
  teamName: z.string().min(1),
  player: MatchEventPlayerSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(), // Additional event-specific data
});

export const BroadcastMatchEventSchema = z.object({
  event: MatchEventSchema,
});

export const SubscribeToMatchSchema = z.object({
  matchId: z.number().int().positive(),
});

export const UnsubscribeFromMatchSchema = SubscribeToMatchSchema;

export const StartMatchSchema = z.object({
  matchId: z.number().int().positive(),
  homeTeam: z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    players: z.array(MatchEventPlayerSchema).length(11),
  }),
  awayTeam: z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
  }),
});

export const MatchEndedSchema = z.object({
  matchId: z.number().int().positive(),
  score: ScoreSchema,
  events: z.array(MatchEventSchema),
});

export const MatchSimulationStateSchema = z.object({
  matchId: z.number().int().positive(),
  homeTeam: z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    players: z.array(MatchEventPlayerSchema),
  }),
  awayTeam: z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
  }),
  score: ScoreSchema,
  currentMinute: z.number().int().min(0).max(120),
  events: z.array(MatchEventSchema),
  startTime: z.date(),
});

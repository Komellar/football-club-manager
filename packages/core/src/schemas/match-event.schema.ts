import { z } from "zod";
import { MatchEventType } from "../enums/match-event-type.enum";

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
  relatedPlayer: MatchEventPlayerSchema.optional(), // For substitutions or assists
  description: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(), // Additional event-specific data
});

export const BroadcastMatchEventSchema = z.object({
  event: MatchEventSchema,
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});

export const SubscribeToMatchSchema = z.object({
  matchId: z.number().int().positive(),
});

export const UnsubscribeFromMatchSchema = z.object({
  matchId: z.number().int().positive(),
});

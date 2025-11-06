import { z } from "zod";
import { MatchEventPlayerSchema } from "./player";
import { MatchEventSchema } from "./event";

const ScoreSchema = z.object({
  home: z.number().int().min(0),
  away: z.number().int().min(0),
});

export const SubscribeToMatchSchema = z.object({
  matchId: z.number().int().positive(),
});

export const UnsubscribeFromMatchSchema = SubscribeToMatchSchema;

const BaseMatchSchema = z.object({
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

export const StartMatchSchema = BaseMatchSchema;

export const MatchEndedSchema = z.object({
  matchId: z.number().int().positive(),
  score: ScoreSchema,
  events: z.array(MatchEventSchema),
});

export const MatchSimulationStateSchema = BaseMatchSchema.extend({
  score: ScoreSchema,
  currentMinute: z.number().int().min(0).max(120),
  events: z.array(MatchEventSchema),
  startTime: z.date(),
});

import { z } from "zod";
import { MatchEventPlayerSchema } from "./player";
import { MatchEventSchema } from "./event";
import {
  MatchPhaseSchema,
  MatchStrengthSchema,
  MatchTacticSchema,
} from "./settings";

const ScoreSchema = z.object({
  home: z.number().int().min(0),
  away: z.number().int().min(0),
});

export const SubscribeToMatchSchema = z.object({});

export const UnsubscribeFromMatchSchema = z.object({});

const BaseMatchSchema = z.object({
  fixtureId: z.uuid().optional(),
  homeTeam: z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    players: z.array(MatchEventPlayerSchema).length(11),
    strength: MatchStrengthSchema.optional(),
    tactic: MatchTacticSchema.optional(),
  }),
  awayTeam: z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    players: z.array(MatchEventPlayerSchema).length(11).optional(),
    strength: MatchStrengthSchema.optional(),
    tactic: MatchTacticSchema.optional(),
  }),
});

export const StartMatchSchema = BaseMatchSchema.extend({
  seed: z.string().min(1).max(100).optional(),
});

export const MatchEndedSchema = z.object({
  matchId: z.uuid(),
  score: ScoreSchema,
  events: z.array(MatchEventSchema),
  phase: MatchPhaseSchema.optional(),
});

export const MatchSimulationStateSchema = BaseMatchSchema.extend({
  matchId: z.uuid(),
  score: ScoreSchema,
  currentMinute: z.number().int().min(0).max(120),
  events: z.array(MatchEventSchema),
  startTime: z.coerce.date(),
  seed: z.string().min(1).max(100).optional(),
  engineVersion: z.string().min(1).optional(),
  phase: MatchPhaseSchema.optional(),
  possession: z
    .object({
      home: z.number().int().nonnegative(),
      away: z.number().int().nonnegative(),
    })
    .optional(),
});

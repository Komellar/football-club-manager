import { z } from "zod";
import { MatchEventType } from "../../enums/match-event-type.enum";
import { MatchEventPlayerSchema } from "./player";

export const MatchEventSchema = z.object({
  id: z.uuid(),
  matchId: z.number().int().positive(),
  type: z.enum(MatchEventType),
  minute: z.number().int().min(0).max(120), // Regular time + extra time
  timestamp: z.date(),
  teamId: z.number().int().positive(),
  teamName: z.string().min(1),
  player: MatchEventPlayerSchema.optional(),
  relatedPlayer: MatchEventPlayerSchema.optional(),
});

import { z } from "zod";
import { MatchEventType } from "../../enums/match-event-type.enum";
import { MatchEventPlayerSchema } from "./player";

export const MatchEventSchema = z
  .object({
    id: z.uuid(),
    matchId: z.uuid(),
    type: z.enum(MatchEventType),
    minute: z.number().int().min(0).max(120), // Regular time + extra time
    timestamp: z.coerce.date(),
    teamId: z.number().int().positive().optional(),
    teamName: z.string().min(1).optional(),
    player: MatchEventPlayerSchema.optional(),
    relatedPlayer: MatchEventPlayerSchema.optional(),
    playId: z.uuid().optional(),
    penaltyOutcome: z.enum(["scored", "saved", "missed"]).optional(),
    isPenalty: z.boolean().optional(),
    goalkeeper: MatchEventPlayerSchema.optional(),
  })
  .superRefine((event, ctx) => {
    const lifecycle = [
      MatchEventType.MATCH_START,
      MatchEventType.HALF_TIME,
      MatchEventType.MATCH_END,
    ].includes(event.type);
    if (!lifecycle && (!event.teamId || !event.teamName || !event.player)) {
      ctx.addIssue({
        code: "custom",
        message: "Play events require a team and player",
      });
    }
    if (lifecycle && (event.player || event.relatedPlayer)) {
      ctx.addIssue({
        code: "custom",
        message: "Lifecycle events cannot name players",
      });
    }
    if (
      event.relatedPlayer &&
      (event.type !== MatchEventType.GOAL ||
        event.relatedPlayer.id === event.player?.id)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Only goals can have an assist from a different player",
        path: ["relatedPlayer"],
      });
    }
    if (
      event.type === MatchEventType.PENALTY &&
      event.playId &&
      !event.penaltyOutcome
    ) {
      ctx.addIssue({
        code: "custom",
        message: "A resolved penalty requires its outcome",
        path: ["penaltyOutcome"],
      });
    }
    if (event.penaltyOutcome && event.type !== MatchEventType.PENALTY) {
      ctx.addIssue({
        code: "custom",
        message: "Only penalty events can have a penalty outcome",
        path: ["penaltyOutcome"],
      });
    }
  });

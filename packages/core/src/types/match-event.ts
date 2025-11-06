import { z } from "zod";
import {
  MatchEventPlayerSchema,
  MatchEventSchema,
  SubscribeToMatchSchema,
  UnsubscribeFromMatchSchema,
  StartMatchSchema,
  MatchEndedSchema,
  MatchSimulationStateSchema,
} from "../schemas/match-event";

export type MatchEventPlayer = z.infer<typeof MatchEventPlayerSchema>;
export type MatchEvent = z.infer<typeof MatchEventSchema>;
export type SubscribeToMatch = z.infer<typeof SubscribeToMatchSchema>;
export type UnsubscribeFromMatch = z.infer<typeof UnsubscribeFromMatchSchema>;
export type StartMatch = z.infer<typeof StartMatchSchema>;
export type MatchEnded = z.infer<typeof MatchEndedSchema>;
export type MatchSimulationState = z.infer<typeof MatchSimulationStateSchema>;

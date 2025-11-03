import { z } from 'zod';
import {
  BroadcastMatchEventSchema,
  MatchEventPlayerSchema,
  MatchEventSchema,
  SubscribeToMatchSchema,
  UnsubscribeFromMatchSchema,
} from '../schemas/match-event.schema';

export type MatchEventPlayer = z.infer<typeof MatchEventPlayerSchema>;
export type MatchEvent = z.infer<typeof MatchEventSchema>;
export type BroadcastMatchEvent = z.infer<typeof BroadcastMatchEventSchema>;
export type SubscribeToMatch = z.infer<typeof SubscribeToMatchSchema>;
export type UnsubscribeFromMatch = z.infer<typeof UnsubscribeFromMatchSchema>;

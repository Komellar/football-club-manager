import { z } from "zod";
import { TicketPriceSchema } from "./stadium";
import {
  MatchSettingsSchema,
  type MatchSettings,
} from "./match-event/settings";
import type { MatchdaySnapshot } from "../types/matchday";
import type {
  MatchEventPlayer,
  MatchSimulationState,
} from "../types/match-event";

export const FixtureStatusSchema = z.enum([
  "scheduled",
  "in_progress",
  "completed",
  "interrupted",
  "cancelled",
]);
export const CreateFixtureSchema = z.object({
  opponentName: z.string().trim().min(2).max(100),
  competition: z.string().trim().min(1).max(100).default("Friendly"),
  kickoffAt: z.iso.datetime({ offset: true }),
  ticketPrice: TicketPriceSchema.nullable().optional(),
  simulationSettings: MatchSettingsSchema.optional(),
});
export const UpdateFixtureSchema = CreateFixtureSchema.partial().extend({
  competition: z.string().trim().min(1).max(100).optional(),
  lineupIds: z.array(z.number().int().positive()).max(11).optional(),
});
export const StartFixtureSchema = z.object({ fixtureId: z.uuid() });
export type CreateFixtureDto = z.infer<typeof CreateFixtureSchema>;
export type UpdateFixtureDto = z.infer<typeof UpdateFixtureSchema>;
export type FixtureStatus = z.infer<typeof FixtureStatusSchema>;
export const MatchHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  outcome: z.enum(["win", "draw", "loss"]).optional(),
});
export type MatchHistoryQuery = z.infer<typeof MatchHistoryQuerySchema>;
export interface MatchHistoryItem {
  id: string;
  opponentName: string;
  competition: string;
  kickoffAt: string;
  completedAt: string;
  score: { home: number; away: number };
}
export interface MatchHistoryPage {
  data: MatchHistoryItem[];
  total: number;
  page: number;
  totalPages: number;
}
export interface FixtureDto {
  id: string;
  opponentName: string;
  competition: string;
  kickoffAt: string;
  status: FixtureStatus;
  lineup: MatchEventPlayer[];
  result: MatchSimulationState | null;
  completedAt: string | null;
  ticketPrice: number | null;
  matchday: MatchdaySnapshot | null;
  simulationSettings?: MatchSettings;
}

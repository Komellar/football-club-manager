import { z } from "zod";
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
});
export const UpdateFixtureSchema = CreateFixtureSchema.partial().extend({
  lineupIds: z.array(z.number().int().positive()).max(11).optional(),
});
export const StartFixtureSchema = z.object({ fixtureId: z.uuid() });
export type CreateFixtureDto = z.infer<typeof CreateFixtureSchema>;
export type UpdateFixtureDto = z.infer<typeof UpdateFixtureSchema>;
export type FixtureStatus = z.infer<typeof FixtureStatusSchema>;
export interface FixtureDto {
  id: string;
  opponentName: string;
  competition: string;
  kickoffAt: string;
  status: FixtureStatus;
  lineup: MatchEventPlayer[];
  result: MatchSimulationState | null;
  completedAt: string | null;
}

import { z } from "zod";

export const MatchTacticSchema = z.enum(["defensive", "balanced", "attacking"]);
export const MatchPhaseSchema = z.enum([
  "first_half",
  "half_time",
  "second_half",
  "saving",
  "completed",
  "interrupted",
]);
export const MatchStrengthSchema = z.number().min(0.5).max(1.5);
export const MatchSettingsSchema = z.object({
  homeStrength: MatchStrengthSchema.default(1),
  opponentStrength: MatchStrengthSchema.default(1),
  homeTactic: MatchTacticSchema.default("balanced"),
  opponentTactic: MatchTacticSchema.default("balanced"),
});
export type MatchSettings = z.infer<typeof MatchSettingsSchema>;
export type MatchPhase = z.infer<typeof MatchPhaseSchema>;
export type MatchTactic = z.infer<typeof MatchTacticSchema>;

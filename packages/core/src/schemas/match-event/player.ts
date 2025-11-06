import { z } from "zod";

export const MatchEventPlayerSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  jerseyNumber: z.number().int().min(1).max(99).optional(),
});

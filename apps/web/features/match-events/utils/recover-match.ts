import { MatchSimulationStateSchema } from "@repo/core";
import type { FixtureDto, MatchSimulationState } from "@repo/core";

export async function recoverCompletedMatch(
  previous: MatchSimulationState | null,
  findFixture: (id: string) => Promise<FixtureDto>,
): Promise<MatchSimulationState | null> {
  if (!previous?.fixtureId) return null;
  const fixture = await findFixture(previous.fixtureId);
  if (
    fixture.status !== "completed" ||
    !fixture.result ||
    fixture.result.matchId !== previous.matchId
  )
    return null;
  return MatchSimulationStateSchema.parse(fixture.result);
}

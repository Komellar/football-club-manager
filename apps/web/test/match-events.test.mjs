import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MatchEventType,
  MatchEventSchema,
  MatchSimulationStateSchema,
} from "@repo/core";
import { lastValueFrom, of, toArray } from "rxjs";
import reducer, {
  startMatch,
  endMatch,
  restoreCompletedMatch,
} from "../features/match-events/store/match-events-slice.ts";
import { recoverCompletedMatch } from "../features/match-events/utils/recover-match.ts";
import { validateMatchMessages } from "../features/match-events/utils/validate-match-messages.ts";
import {
  calculateMatchStats,
  getStatShare,
} from "../features/match-events/utils/calculate-match-stats.ts";

const match = {
  fixtureId: "83ce6cb0-700d-4a39-a647-921c49c6df53",
  matchId: "00000000-0000-4000-8000-000000000001",
  homeTeam: {
    id: 1,
    name: "Home",
    players: Array.from({ length: 11 }, (_, index) => ({
      id: index + 1,
      name: `Player ${index + 1}`,
      position: "forward",
    })),
  },
  awayTeam: { id: 2, name: "Away" },
  score: { home: 1, away: 0 },
  currentMinute: 87,
  events: [],
  startTime: new Date("2026-10-02T12:00:00Z"),
};

test("missing active match clears the stale snapshot", () => {
  const state = reducer(reducer(undefined, startMatch(match)), endMatch());
  assert.equal(state.activeMatch, null);
  assert.equal(state.isMatchActive, false);
});

test("reconnect loads the saved final score and hydrates its dates", async () => {
  let requested;
  const result = await recoverCompletedMatch(match, async (id) => {
    requested = id;
    return {
      status: "completed",
      result: JSON.parse(
        JSON.stringify({
          ...match,
          currentMinute: 90,
          score: { home: 2, away: 1 },
        }),
      ),
    };
  });
  assert.equal(requested, match.fixtureId);
  const state = reducer(undefined, restoreCompletedMatch(result));
  assert.deepEqual(state.activeMatch.score, { home: 2, away: 1 });
  assert.equal(state.activeMatch.currentMinute, 90);
  assert.equal(state.isMatchActive, false);
  assert.ok(state.activeMatch.startTime instanceof Date);
});

test("interrupted and replayed fixtures do not restore stale match data", async () => {
  assert.equal(
    await recoverCompletedMatch(match, async () => ({
      status: "interrupted",
      result: null,
    })),
    null,
  );
  assert.equal(
    await recoverCompletedMatch(match, async () => ({
      status: "completed",
      result: { ...match, matchId: "00000000-0000-4000-8000-000000000002" },
    })),
    null,
  );
});

test("an unrelated completion cannot stop the current match", () => {
  const state = reducer(
    reducer(undefined, startMatch(match)),
    endMatch({
      matchId: "another-match",
      score: { home: 0, away: 0 },
      events: [],
    }),
  );
  assert.equal(state.isMatchActive, true);
  assert.deepEqual(state.activeMatch.score, match.score);
});

test("completion advances the clock to the final event minute", () => {
  const state = reducer(
    reducer(undefined, startMatch(match)),
    endMatch({
      matchId: match.matchId,
      score: { home: 2, away: 1 },
      events: [{ type: MatchEventType.MATCH_END, minute: 90 }],
    }),
  );
  assert.equal(state.activeMatch.currentMinute, 90);
  assert.equal(state.isMatchActive, false);
});

test("phase snapshots keep saving active and completed matches inactive", () => {
  for (const phase of [
    "first_half",
    "half_time",
    "second_half",
    "saving",
    "completed",
    "interrupted",
  ]) {
    const state = reducer(undefined, startMatch({ ...match, phase }));
    assert.equal(
      state.isMatchActive,
      !["completed", "interrupted"].includes(phase),
    );
    assert.equal(state.activeMatch.phase, phase);
  }
});

test("penalty goals count as a single goal and shot with possession", () => {
  const stats = calculateMatchStats({
    ...match,
    possession: { home: 54, away: 36 },
    events: [
      {
        type: MatchEventType.PENALTY,
        teamId: 1,
        minute: 20,
        penaltyOutcome: "scored",
      },
      { type: MatchEventType.GOAL, teamId: 1, minute: 20, isPenalty: true },
    ],
  });
  assert.deepEqual(stats.goals, { home: 1, away: 0 });
  assert.deepEqual(stats.shotsOnTarget, { home: 1, away: 0 });
  assert.deepEqual(stats.possession, { home: 60, away: 40 });
});

test("legacy second yellows count once and zero-stat bars remain finite", () => {
  const stats = calculateMatchStats({
    ...match,
    events: [
      {
        type: MatchEventType.CARD_YELLOW,
        teamId: 1,
        minute: 20,
        player: { id: 2 },
      },
      {
        type: MatchEventType.CARD_YELLOW,
        teamId: 1,
        minute: 30,
        player: { id: 2 },
      },
      {
        type: MatchEventType.CARD_RED,
        teamId: 2,
        minute: 50,
        player: { id: 2 },
      },
    ],
  });
  assert.deepEqual(stats.redCards, { home: 1, away: 1 });
  assert.equal(getStatShare(0, 0), 0);
  assert.equal(getStatShare(1, 3), 25);
});

test("live socket snapshots hydrate dates and retain the current phase", async () => {
  const payload = JSON.parse(JSON.stringify({ ...match, phase: "saving" }));
  const [state] = await lastValueFrom(
    of(payload).pipe(
      validateMatchMessages(MatchSimulationStateSchema, () =>
        assert.fail("Valid snapshot rejected"),
      ),
      toArray(),
    ),
  );
  assert.ok(state.startTime instanceof Date);
  assert.equal(state.phase, "saving");
});

test("a malformed socket event is rejected without closing the event stream", async () => {
  let invalid = 0;
  const goal = {
    id: "00000000-0000-4000-8000-000000000005",
    matchId: match.matchId,
    type: MatchEventType.GOAL,
    minute: 20,
    timestamp: "2026-10-02T12:00:03Z",
    teamId: 1,
    teamName: "Home",
    player: match.homeTeam.players[0],
  };
  const events = await lastValueFrom(
    of({ ...goal, player: undefined }, goal).pipe(
      validateMatchMessages(MatchEventSchema, () => invalid++),
      toArray(),
    ),
  );
  assert.equal(invalid, 1);
  assert.equal(events.length, 1);
  assert.ok(events[0].timestamp instanceof Date);
});

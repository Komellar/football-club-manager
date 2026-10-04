import { test } from "node:test";
import assert from "node:assert/strict";
import { PlayerStatisticsTotalsSchema } from "@repo/core";
import {
  getSummaryCards,
  getGoalsAndAssistsBySeason,
  getPerformanceRatingsBySeason,
  getTotalStatsBySeason,
} from "../features/players/utils/performance.ts";

test("performance cards use the full server summary and weighted rating", () => {
  const summary = {
    playerId: 1,
    totals: PlayerStatisticsTotalsSchema.parse({
      appearances: 17,
      minutesPlayed: 1530,
      goals: 17,
      assists: 17,
      rating: 6.75,
    }),
    seasons: [
      {
        ...PlayerStatisticsTotalsSchema.parse({
          appearances: 12,
          goals: 12,
          assists: 12,
          rating: 6,
        }),
        season: "2024/2025",
      },
      {
        ...PlayerStatisticsTotalsSchema.parse({
          appearances: 5,
          goals: 5,
          assists: 5,
          rating: 9,
        }),
        season: "2025/2026",
      },
    ],
  };
  const cards = getSummaryCards(summary, (key) => key);
  assert.deepEqual(
    cards.map((card) => card.value),
    [17, 17, 17, "6.8"],
  );
  assert.equal(
    getGoalsAndAssistsBySeason(summary.seasons).reduce(
      (sum, season) => sum + season.goals,
      0,
    ),
    17,
  );
});

test("season charts preserve absent ratings and do not mutate source order", () => {
  const seasons = [
    {
      ...PlayerStatisticsTotalsSchema.parse({ appearances: 1, rating: null }),
      season: "2025/2026",
    },
    {
      ...PlayerStatisticsTotalsSchema.parse({ appearances: 1, rating: 4.25 }),
      season: "2024/2025",
    },
  ];
  assert.deepEqual(getPerformanceRatingsBySeason(seasons), [
    { season: "2024/2025", rating: 4.3 },
    { season: "2025/2026", rating: null },
  ]);
  assert.deepEqual(
    getTotalStatsBySeason(seasons).map((season) => season.season),
    ["2025/2026", "2024/2025"],
  );
  assert.equal(seasons[0].season, "2025/2026");
});

# Codebase review fixes

The review's match simulation, authentication, contract, transfer, and player performance findings are covered by this change.

## Match simulation

- Completion saves the fixture report and all eleven starters' statistics in one PostgreSQL transaction. A fixture row lock serializes concurrent completion; a unique `(match_id, player_id)` index prevents duplicate rows. Failed saves roll back both parts, retain the final state, and retry after five seconds. Successful completion is broadcast after the commit.
- Statistics calculation has no database side effects. Every starter receives a row, including players without events. Recorded minutes stop at dismissal; a second yellow produces one dismissal. Saves and conceded goals use the player who actually acted as goalkeeper. The season uses the match's UTC start time.
- Direct reds and second yellows exclude players from later actions and assists. Both teams retain the same eleven identities throughout the simulation, and away goals can have assists.
- Each simulated minute produces possession and an optional linked play. Fouls can produce cards or penalties; shots can produce a goal, save, miss, or corner. Events in one play share `playId`. Penalties record `scored`, `saved`, or `missed` and generate exactly one shot outcome; penalty goals have no assist.
- Positions affect participant selection and team attack, defence, and possession. Goalkeepers are excluded from shots and assists. The fixture's team strengths (0.5–1.5) and defensive/balanced/attacking approaches influence chances and are saved with the starting lineup in the report.
- Engine version `2.0` records a seed and uses deterministic random draws per minute. Football outcomes can be reproduced using the same seed, starting teams, settings, and engine version. Event IDs and wall-clock timestamps remain unique. Existing unseeded reports cannot be reconstructed from a seed.
- Phases distinguish the first half, halftime, second half, saving, completion, and interruption. The clock is broadcast even when no play occurs, halftime is observable, and minute 90 is simulated before completion. Lifecycle markers are neutral; shared schemas validate play payloads and hydrate serialized dates. Older reports remain readable without new optional metadata.
- Reconnecting browsers recover the current state or their saved final report. Interrupted matches clear stale active state. Delayed recovery responses cannot replace a newer match or restore state after logout. Statistics bars handle a zero total, possession is displayed, and penalty outcomes and assists appear in timelines.

## Other reviewed areas

- Public registration creates a normal user. JWT identities use `userId`; guards normalize older signed tokens containing `id`. Logout closes the match socket, and the server disconnects subscriptions when the token expires.
- PostgreSQL `DATE` columns for contracts, transfers, and player birth dates are hydrated consistently. Finance calculations normalize dates and use UTC calendar operations, preserving signing and agent fees in their correct reporting period. The existing whole-month wage model is retained.
- Contract and transfer patches accept omitted identity/status fields. Updates validate the merged stored record, so a one-date patch cannot create reversed contract or loan dates. Nullable transfer fields can be cleared explicitly. Completed transfer status remains immutable.
- Transfer validation replays completed movements chronologically. A past signing allows a later sale and subsequent signing. Active loans block overlapping movements; returns must match the lending club and reverse direction. Expired loans restore ownership, and current-club reporting ignores future and pending movements. Player locks serialize creation, edits, and deletion; deletion rechecks completion after locking. Notes-only edits remain possible on completed history.
- Player performance uses a new server aggregate endpoint, `GET /statistics/player/:playerId/summary`, across every record rather than the first paginated page. Season and career totals include all appearances, and career rating is weighted by the number of rated appearances. Missing ratings stay absent in charts, whose rating axis covers the full 1–10 range.
- The landing-page redirect now occurs outside the profile-fetch catch block, avoiding interception of Next.js's redirect exception. Numeric inputs respect zero bounds. The existing frontend lint warnings were resolved.
- Jest resolves shared schemas from source, Supertest uses its CommonJS import correctly, and Turbo builds shared dependencies before tests. The shared ESLint configuration no longer references an unregistered Prettier plugin.

## Upgrade

Build shared schemas and apply migrations before starting the updated backend:

```sh
pnpm --filter @repo/core build
pnpm --filter backend migration:run
pnpm build
```

The new migrations are:

- `LinkMatchPlayerStatistics1790899200000`: adds a nullable match link and unique match/player index. Historical rows remain available; their originating matches are not inferred or backfilled.
- `AddFixtureSimulationSettings1790899201000`: adds fixture settings in JSONB. Existing fixtures use balanced tactics and strength 1 by default.

The development database was not migrated during this work. Database verification used a separate disposable PostgreSQL container.

## Calibration

Run the same engine without sockets, timers, or database writes:

```sh
pnpm --filter @repo/core build
pnpm --filter backend simulate:calibrate 5000 review
```

Measured averages across 5,000 seeded matches using balanced teams:

| Metric                 | Per match |
| ---------------------- | --------: |
| Goals                  |    2.8096 |
| Home goals             |    1.4574 |
| Away goals             |    1.3522 |
| Shots, including goals |   21.5616 |
| Yellow cards           |    3.5798 |
| Direct red cards       |    0.0940 |
| Penalties              |    0.3290 |

These measurements characterize the game's balancing model. They are not validation against a real competition dataset. A fixed 1,000-match regression batch checks broad goal, shot, and discipline ranges; additional tests verify seed replay, position eligibility, formation, strength, tactics, and each penalty outcome.

## Validation

Verified 237 backend unit tests, eight backend end-to-end tests (seven using PostgreSQL), and twelve frontend regression tests: 257 passing tests. Backend and frontend type checks pass. All 68 changed backend/frontend TypeScript files pass ESLint without errors or warnings. The monorepo production build passes. The disposable PostgreSQL container was removed after verification.

```sh
pnpm --filter backend exec jest --runInBand
pnpm --filter web test
pnpm --filter backend exec tsc --noEmit
pnpm --filter web check-types
pnpm build
```

The frontend tests use Node's native TypeScript stripping and require Node 22.6 or newer. They exercise reducer/reconnect behavior, phases, match counters, and performance transformations without a browser.

For database verification, set `TEST_DATABASE_URL` to a disposable PostgreSQL database and run:

```sh
pnpm --filter backend exec jest --config test/jest-e2e.json --runInBand
```

The suite creates and drops a private schema and applies both actual migrations. It checks concurrent completion, rollback, uniqueness, date hydration and fees, partial contract updates, transfer ordering and locking, and aggregates across more than ten matches. Database tests are skipped when the variable is absent.

## Further features

Substitutions, individual player abilities and progression, extra time, and durable mid-match resumption remain future features. Active matches still run on one backend process; a process restart marks unfinished fixtures interrupted.

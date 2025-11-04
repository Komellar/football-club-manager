export const MATCH_SIMULATION_CONFIG = {
  TICK_INTERVAL_MS: 1000, // 1 real second
  MINUTES_PER_TICK: 5, // 5 in-game minutes per tick
  HALF_TIME_MINUTE: 45,
  FULL_TIME_MINUTE: 90,
  HOME_ADVANTAGE_PROBABILITY: 0.6, // 60% chance for home team
  EVENT_GENERATION_PROBABILITY: 1, // 100% chance to generate event per tick
} as const;

export const OPPONENT_PLAYER_ID_OFFSET = 1000;
export const MAX_JERSEY_NUMBER = 99;

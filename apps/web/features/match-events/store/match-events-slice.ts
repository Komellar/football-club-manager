"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { MatchEventType } from "@repo/core";
import type { MatchEvent, MatchSimulationState, MatchEnded } from "@repo/core";

export interface MatchEventsState {
  activeMatch: MatchSimulationState | null;
  isConnected: boolean;
  isMatchActive: boolean;
  error: string | null;
}

const initialState: MatchEventsState = {
  activeMatch: null,
  isConnected: false,
  isMatchActive: false,
  error: null,
};

const matchEventsSlice = createSlice({
  name: "matchEvents",
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (!action.payload) {
        state.error = "Disconnected from server";
      } else {
        state.error = null;
      }
    },
    startMatch: (state, action: PayloadAction<MatchSimulationState>) => {
      state.activeMatch = action.payload;
      state.isMatchActive = !["completed", "interrupted"].includes(
        action.payload.phase ?? "first_half",
      );
      state.error = null;
    },
    restoreCompletedMatch: (
      state,
      action: PayloadAction<MatchSimulationState>,
    ) => {
      state.activeMatch = action.payload;
      state.isMatchActive = false;
      state.error = null;
    },
    addMatchEvent: (state, action: PayloadAction<MatchEvent>) => {
      const event = action.payload;
      const match = state.activeMatch;
      if (
        !match ||
        event.matchId !== match.matchId ||
        match.events.some((e) => e.id === event.id)
      )
        return;

      match.currentMinute = event.minute;
      match.events.push(event);

      if (event.type === MatchEventType.GOAL) {
        if (event.teamId === match.homeTeam.id) {
          match.score.home++;
        } else {
          match.score.away++;
        }
      }
    },
    endMatch: (state, action: PayloadAction<MatchEnded | undefined>) => {
      if (!action.payload) {
        state.activeMatch = null;
        state.isMatchActive = false;
        return;
      }
      if (state.activeMatch?.matchId !== action.payload.matchId) return;
      state.activeMatch.score = action.payload.score;
      state.activeMatch.events = action.payload.events;
      state.activeMatch.phase = action.payload.phase ?? "completed";
      state.activeMatch.currentMinute = action.payload.events.reduce(
        (minute, event) => Math.max(minute, event.minute),
        state.activeMatch.currentMinute,
      );
      state.isMatchActive = false;
    },
    clearMatch: (state) => {
      state.activeMatch = null;
      state.isMatchActive = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setConnectionStatus,
  startMatch,
  restoreCompletedMatch,
  addMatchEvent,
  endMatch,
  clearMatch,
  setError,
} = matchEventsSlice.actions;

export default matchEventsSlice.reducer;

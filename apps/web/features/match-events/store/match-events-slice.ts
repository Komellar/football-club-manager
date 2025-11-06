"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  MatchEvent,
  MatchEventType,
  type MatchSimulationState,
} from "@repo/core";

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
      state.isMatchActive = true;
      state.error = null;
    },
    addMatchEvent: (state, action: PayloadAction<MatchEvent>) => {
      const event = action.payload;
      const match = state.activeMatch!;

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
    endMatch: (state) => {
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
  addMatchEvent,
  endMatch,
  clearMatch,
  setError,
} = matchEventsSlice.actions;

export default matchEventsSlice.reducer;

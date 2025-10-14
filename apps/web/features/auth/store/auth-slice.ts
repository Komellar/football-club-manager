"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@repo/core";
import { checkAuth, logout } from "./auth-thunks";

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    clearAuth: (state) => {
      Object.assign(state, initialState, { isLoading: false });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        Object.assign(state, initialState, { isLoading: false });
      })
      .addCase(logout.rejected, (state) => {
        // Clear auth state even if logout fails
        Object.assign(state, initialState, { isLoading: false });
      });
  },
});

export const { setToken, clearAuth } = authSlice.actions;

export default authSlice.reducer;

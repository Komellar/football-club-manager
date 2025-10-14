import { createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "@repo/core";
import { getProfile, logout as logoutApi } from "../utils/auth-api";

export const checkAuth = createAsyncThunk<
  User | null,
  void,
  { rejectValue: string }
>("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const userData = await getProfile();
    return userData;
  } catch (error) {
    console.error("Auth check failed:", error);
    return rejectWithValue("Failed to verify authentication");
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails on server, we'll clear local state
      return rejectWithValue("Logout failed");
    }
  }
);

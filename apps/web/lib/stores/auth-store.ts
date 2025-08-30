"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getProfileAction, logoutAction } from "@/actions/auth-actions";

export interface User {
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      // Actions
      setUser: (user) =>
        set(
          { user, isAuthenticated: !!user, error: null },
          false,
          "auth/setUser"
        ),

      setLoading: (loading) =>
        set({ isLoading: loading }, false, "auth/setLoading"),

      setError: (error) => set({ error }, false, "auth/setError"),

      checkAuth: async () => {
        const { setLoading, setUser, setError } = get();

        try {
          setLoading(true);
          setError(null);

          const userData = await getProfileAction();
          setUser(userData);
        } catch (error) {
          console.error("Auth check failed:", error);
          setError("Failed to verify authentication");
          setUser(null);
        } finally {
          setLoading(false);
        }
      },

      logout: async () => {
        const { setLoading, clearAuth } = get();

        try {
          setLoading(true);
          await logoutAction();
          clearAuth();
        } catch (error) {
          console.error("Logout failed:", error);
          // Clear auth state even if logout action fails
          clearAuth();
        } finally {
          setLoading(false);
        }
      },

      clearAuth: () =>
        set(
          {
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          },
          false,
          "auth/clearAuth"
        ),
    }),
    {
      name: "auth-store",
    }
  )
);

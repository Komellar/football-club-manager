"use client";

import { useEffect } from "react";
import { checkAuth } from "../store/auth-thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { matchEventsSocket } from "@/features/match-events/services/match-events-socket.service";
import { clearMatch } from "@/features/match-events/store/match-events-slice";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication status when the app initializes
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      matchEventsSocket.disconnect();
      dispatch(clearMatch());
    }
  }, [dispatch, isAuthenticated, isLoading]);

  return <>{children}</>;
}

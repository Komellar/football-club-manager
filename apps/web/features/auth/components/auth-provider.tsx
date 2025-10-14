"use client";

import { useEffect } from "react";
import { checkAuth } from "../store/auth-thunks";
import { useAppDispatch } from "@/store/hooks";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check authentication status when the app initializes
    dispatch(checkAuth());
  }, [dispatch]);

  return <>{children}</>;
}

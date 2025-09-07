"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Check authentication status when the app initializes
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}

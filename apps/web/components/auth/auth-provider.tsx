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

  // You can add a loading spinner here if needed
  // For now, we'll render children immediately and let individual
  // components handle their own auth loading states
  return <>{children}</>;
}

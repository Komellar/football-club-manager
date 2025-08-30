"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth-store";

export function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);

  return (
    <Button variant="outline" onClick={logout} disabled={isLoading}>
      {isLoading ? "Signing out..." : "Sign out"}
    </Button>
  );
}

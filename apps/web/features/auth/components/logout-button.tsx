"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "../store/auth-store";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);
  const t = useTranslations("Auth");

  return (
    <Button variant="outline" onClick={logout} disabled={isLoading}>
      {isLoading ? t("signingOut") : t("signOut")}
    </Button>
  );
}

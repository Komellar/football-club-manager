"use client";

import { Button } from "@/components/ui/button";
import { logout } from "../store/auth-thunks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const t = useTranslations("Auth");

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isLoading}>
      {isLoading ? t("signingOut") : t("signOut")}
    </Button>
  );
}

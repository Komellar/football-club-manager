"use client";

import { LogoutButton, AuthGuard, useAuthStore } from "@/features/auth";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{tCommon("loading")}</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthGuard will handle redirect
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600">{t("welcome")}</p>
      </div>
      <LogoutButton />
    </div>
  );
}

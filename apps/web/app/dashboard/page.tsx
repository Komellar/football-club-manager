"use client";

import { LogoutButton, AuthGuard, useAuthStore } from "@/features/auth";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Loading Dashboard...</h2>
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
        <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
      </div>
      <LogoutButton />
    </div>
  );
}

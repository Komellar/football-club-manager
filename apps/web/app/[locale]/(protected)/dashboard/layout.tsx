import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

interface DashboardLayoutProps {
  children: ReactNode;
  contracts: ReactNode;
}

export default async function DashboardLayout({
  children,
  contracts,
}: DashboardLayoutProps) {
  const t = await getTranslations("Dashboard");

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-6">
          {contracts}
          {children}
        </div>
      </div>
    </div>
  );
}

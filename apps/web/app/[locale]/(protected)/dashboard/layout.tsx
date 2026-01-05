import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

interface DashboardLayoutProps {
  children: ReactNode;
  contracts: ReactNode;
  finance: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: DashboardLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
    },
  };
}

export default async function DashboardLayout({
  children,
  finance,
  contracts,
}: DashboardLayoutProps) {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-12">
          {finance}
          {contracts}
          {children}
        </div>
      </div>
    </div>
  );
}

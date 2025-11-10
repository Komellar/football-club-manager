"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useSelectedLayoutSegment } from "next/navigation";

interface PlayerTabNavigationProps {
  playerId: number;
}

export function PlayerTabNavigation({ playerId }: PlayerTabNavigationProps) {
  const params = useParams();
  const segment = useSelectedLayoutSegment();
  const locale = params.locale as string;
  const t = useTranslations("Players");

  // Determine active tab based on the current route segment
  const activeTab = segment || "details";

  return (
    <Tabs value={activeTab} className="w-full">
      <TabsList>
        <Link href={`/${locale}/players/${playerId}/details`}>
          <TabsTrigger value="details">{t("playerDetails")}</TabsTrigger>
        </Link>
        <Link href={`/${locale}/players/${playerId}/contracts`}>
          <TabsTrigger value="contracts">{t("contracts")}</TabsTrigger>
        </Link>
        <Link href={`/${locale}/players/${playerId}/performance`}>
          <TabsTrigger value="performance">{t("performance")}</TabsTrigger>
        </Link>
      </TabsList>
    </Tabs>
  );
}

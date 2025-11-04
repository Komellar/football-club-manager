"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  calculateMatchStats,
  getStatRows,
} from "../utils/calculate-match-stats";

export const MatchStatsCard = () => {
  const t = useTranslations("MatchEvents");

  const { activeMatch } = useAppSelector((state) => state.matchEvents);

  const stats = useMemo(() => calculateMatchStats(activeMatch), [activeMatch]);

  if (!stats) {
    return null;
  }

  const statRows = getStatRows(stats, t);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{t("events")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statRows.map((stat, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="font-bold text-right flex-1">{stat.home}</span>
              <span className="text-sm text-muted-foreground flex-1 text-center px-4">
                {stat.label}
              </span>
              <span className="font-bold text-left flex-1">{stat.away}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

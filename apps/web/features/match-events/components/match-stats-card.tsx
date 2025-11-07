"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  calculateMatchStats,
  getStatRows,
} from "../utils/calculate-match-stats";
import { Progress } from "@/components/ui/progress";

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
            <div key={index}>
              <div className="flex justify-center items-center">
                <span className="font-bold text-right">{stat.home}</span>
                <span className="text-sm text-muted-foreground text-center px-4 w-35">
                  {stat.label}
                </span>
                <span className="font-bold text-left ">{stat.away}</span>
              </div>
              <div
                key={index}
                className="flex justify-between items-center w-[80%] mx-auto"
              >
                <Progress
                  value={(stat.home / (stat.home + stat.away)) * 100}
                  className="w-[50%] rotate-180 h-2 rounded-[2px]"
                />
                <div className="w-1" />
                <Progress
                  value={(stat.away / (stat.home + stat.away)) * 100}
                  className="w-[50%] h-2 rounded-[2px] bg-blue-100 [&>div]:bg-secondary"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

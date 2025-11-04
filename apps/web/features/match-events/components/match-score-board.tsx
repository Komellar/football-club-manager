"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/store";

export function MatchScoreBoard() {
  const t = useTranslations("MatchEvents");

  const { activeMatch, isMatchActive } = useAppSelector(
    (state) => state.matchEvents
  );

  if (!activeMatch) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{t("score")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {activeMatch.homeTeam.name}
              </div>
              <div className="text-sm text-muted-foreground">{t("home")}</div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold tabular-nums">
                {activeMatch.score.home} - {activeMatch.score.away}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold mb-2">
                {activeMatch.awayTeam.name}
              </div>
              <div className="text-sm text-muted-foreground">{t("away")}</div>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
              {isMatchActive && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
              <span className="text-lg font-semibold">
                {activeMatch.currentMinute}' {isMatchActive ? "⚽" : ""}
              </span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {isMatchActive
              ? t("matchInProgress")
              : activeMatch.currentMinute === 90
                ? t("matchEnded")
                : t("matchNotStarted")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

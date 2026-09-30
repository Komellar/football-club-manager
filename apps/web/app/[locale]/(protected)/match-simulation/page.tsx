"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import {
  matchEventsSocket,
  MatchStatsCard,
  MatchEventList,
  MatchScoreBoard,
  ConnectionStatus,
} from "@/features/match-events";
import { Button } from "@/components/ui/button";

export default function MatchSimulationPage() {
  const t = useTranslations("MatchEvents");
  const f = useTranslations("Fixtures");
  const locale = useLocale();
  const { activeMatch, isMatchActive, error } = useAppSelector(
    (s) => s.matchEvents,
  );
  useEffect(() => {
    matchEventsSocket.connect();
    void matchEventsSocket.subscribeToMatch().catch(() => {});
  }, []);
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <Button asChild>
          <Link href={`/${locale}/fixtures`}>{f("title")}</Link>
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <ConnectionStatus />
      {activeMatch?.fixtureId && !isMatchActive && (
        <Button asChild variant="outline">
          <Link href={`/${locale}/match-history/${activeMatch.fixtureId}`}>
            {f("report")}
          </Link>
        </Button>
      )}
      {activeMatch ? (
        <>
          <MatchScoreBoard />
          <MatchStatsCard />
          <MatchEventList />
        </>
      ) : (
        <p>{f("chooseFixture")}</p>
      )}
    </div>
  );
}

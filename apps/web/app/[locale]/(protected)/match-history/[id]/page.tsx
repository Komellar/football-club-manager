"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { FixtureDto } from "@repo/core";
import { fixturesApi, fixtureError } from "@/features/fixtures/api";
import { MatchReport } from "@/features/fixtures/match-report";
import { Button } from "@/components/ui/button";

export default function MatchReportPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useLocale();
  const t = useTranslations("MatchHistory");
  const [fixture, setFixture] = useState<FixtureDto | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setFixture(null);
    setError("");
    fixturesApi
      .report(id)
      .then((f) => {
        if (!cancelled) setFixture(f);
      })
      .catch((e) => {
        if (!cancelled) setError(fixtureError(e));
      });
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Link className="underline" href={`/${locale}/match-history`}>
        {t("back")}
      </Link>
      {error ? (
        <div role="alert">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => setAttempt((n) => n + 1)}>
            {t("retry")}
          </Button>
        </div>
      ) : fixture ? (
        <MatchReport fixture={fixture} />
      ) : (
        <p role="status">{t("loading")}</p>
      )}
    </div>
  );
}

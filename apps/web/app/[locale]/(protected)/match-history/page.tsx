"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import type { MatchHistoryPage, MatchHistoryQuery } from "@repo/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fixturesApi, fixtureError } from "@/features/fixtures/api";

export default function MatchHistory() {
  const t = useTranslations("MatchHistory");
  const locale = useLocale();
  const [data, setData] = useState<MatchHistoryPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [outcome, setOutcome] = useState("");
  const [query, setQuery] = useState<MatchHistoryQuery>({ page: 1, limit: 20 });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fixturesApi
      .history(query)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((e) => {
        if (!cancelled) setError(fixtureError(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, attempt]);
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <Button asChild variant="outline">
          <Link href={`/${locale}/fixtures`}>{t("fixtures")}</Link>
        </Button>
      </div>
      <p className="text-muted-foreground">{t("description")}</p>
      <form
        className="flex flex-wrap items-end gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery({
            page: 1,
            limit: 20,
            search: search.trim() || undefined,
            outcome: outcome
              ? (outcome as MatchHistoryQuery["outcome"])
              : undefined,
          });
        }}
      >
        <label className="space-y-2 grow">
          {t("search")}
          <Input
            value={search}
            maxLength={100}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label className="space-y-2">
          {t("result")}
          <select
            className="block h-9 rounded-md border bg-background px-3"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
          >
            <option value="">{t("all")}</option>
            <option value="win">{t("win")}</option>
            <option value="draw">{t("draw")}</option>
            <option value="loss">{t("loss")}</option>
          </select>
        </label>
        <Button type="submit">{t("filter")}</Button>
      </form>
      {loading ? (
        <p role="status">{t("loading")}</p>
      ) : error ? (
        <div role="alert">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => setAttempt((n) => n + 1)}>
            {t("retry")}
          </Button>
        </div>
      ) : (
        data && (
          <>
            <p role="status">{t("count", { count: data.total })}</p>
            {data.data.length === 0 ? (
              <p className="rounded-xl border p-8 text-muted-foreground">
                {t("empty")}
              </p>
            ) : (
              <ul className="space-y-3">
                {data.data.map((match) => {
                  const result =
                    match.score.home > match.score.away
                      ? "win"
                      : match.score.home === match.score.away
                        ? "draw"
                        : "loss";
                  return (
                    <li key={match.id}>
                      <Link
                        href={`/${locale}/match-history/${match.id}`}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5 hover:bg-muted"
                      >
                        <div>
                          <p className="font-semibold">
                            {t("versus", { opponent: match.opponentName })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {match.competition} ·{" "}
                            {new Date(match.kickoffAt).toLocaleString(locale)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold tabular-nums">
                            {match.score.home} – {match.score.away}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${result === "win" ? "bg-green-100 text-green-900" : result === "loss" ? "bg-red-100 text-red-900" : "bg-muted text-muted-foreground"}`}
                          >
                            {t(result)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            {data.totalPages > 1 && (
              <nav
                aria-label={t("pagination")}
                className="flex items-center justify-center gap-4"
              >
                <Button
                  variant="outline"
                  disabled={query.page <= 1}
                  onClick={() => setQuery({ ...query, page: query.page - 1 })}
                >
                  {t("previous")}
                </Button>
                <span>
                  {t("page", { page: query.page, total: data.totalPages })}
                </span>
                <Button
                  variant="outline"
                  disabled={query.page >= data.totalPages}
                  onClick={() => setQuery({ ...query, page: query.page + 1 })}
                >
                  {t("next")}
                </Button>
              </nav>
            )}
          </>
        )
      )}
    </div>
  );
}

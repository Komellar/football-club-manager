"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FixtureDto } from "@repo/core";
import { Button } from "@/components/ui/button";
import { FixtureFields } from "@/features/fixtures/fixture-fields";
import { fixturesApi, fixtureError } from "@/features/fixtures/api";

export default function FixturesPage() {
  const t = useTranslations("Fixtures");
  const history = useTranslations("MatchHistory");
  const locale = useLocale();
  const router = useRouter();
  const [fixtures, setFixtures] = useState<FixtureDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [opponent, setOpponent] = useState("");
  const [kickoff, setKickoff] = useState("");
  const [competition, setCompetition] = useState(t("friendly"));
  async function load() {
    setLoading(true);
    setError("");
    try {
      setFixtures(await fixturesApi.list());
    } catch (e) {
      setError(fixtureError(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <Link
        href={`/${locale}/match-history`}
        className="inline-block underline"
      >
        {history("title")}
      </Link>
      <p className="text-muted-foreground">{t("description")}</p>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <form
        className="rounded-xl border p-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          setError("");
          try {
            const f = await fixturesApi.create({
              opponentName: opponent,
              kickoffAt: new Date(kickoff).toISOString(),
              competition,
            });
            router.push(`/${locale}/fixtures/${f.id}`);
          } catch (e) {
            setError(fixtureError(e));
          } finally {
            setSaving(false);
          }
        }}
      >
        <h2 className="text-xl font-semibold">{t("create")}</h2>
        <FixtureFields
          {...{
            opponent,
            setOpponent,
            kickoff,
            setKickoff,
            competition,
            setCompetition,
          }}
          disabled={saving}
        />
        <Button disabled={saving}>{saving ? t("saving") : t("create")}</Button>
      </form>
      {loading ? (
        <p>{t("loading")}</p>
      ) : (
        <section className="space-y-3">
          {fixtures.length === 0 && <p>{t("empty")}</p>}
          {fixtures.map((f) => (
            <Link
              key={f.id}
              href={`/${locale}/fixtures/${f.id}`}
              className="flex flex-wrap justify-between gap-3 rounded-xl border p-5 hover:bg-muted"
            >
              <div>
                <p className="font-semibold">
                  {t("versus", { opponent: f.opponentName })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {f.competition} ·{" "}
                  {new Date(f.kickoffAt).toLocaleString(locale)}
                </p>
              </div>
              <div>
                {f.result
                  ? `${f.result.score.home} – ${f.result.score.away} · `
                  : ""}
                {t(`statuses.${f.status}`)}
              </div>
            </Link>
          ))}
          {error && (
            <Button variant="outline" onClick={load}>
              {t("retry")}
            </Button>
          )}
        </section>
      )}
    </div>
  );
}

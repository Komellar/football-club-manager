"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FixtureDto,
  MatchEventPlayer,
  PlayerPosition,
  TicketPriceSchema,
} from "@repo/core";
import { FixtureTicketing } from "@/features/stadium/fixture-ticketing";
import { Button } from "@/components/ui/button";
import { FixtureFields } from "@/features/fixtures/fixture-fields";
import {
  fixturesApi,
  fixtureError,
  localDateTime,
} from "@/features/fixtures/api";
import { LineupSelector } from "@/features/match-events/components/lineup-selector";
import { matchEventsSocket } from "@/features/match-events";
import { useAppSelector } from "@/store/hooks";

export default function FixturePage() {
  const { id } = useParams<{ id: string }>();
  const locale = useLocale();
  const t = useTranslations("Fixtures");
  const router = useRouter();
  const [fixture, setFixture] = useState<FixtureDto | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [opponent, setOpponent] = useState("");
  const [kickoff, setKickoff] = useState("");
  const [competition, setCompetition] = useState("");
  const [lineup, setLineup] = useState<MatchEventPlayer[]>([]);
  const [ticketPrice, setTicketPrice] = useState("");
  const { isConnected, isMatchActive } = useAppSelector((s) => s.matchEvents);
  const editable =
    fixture?.status === "scheduled" || fixture?.status === "interrupted";
  const ready =
    lineup.length === 11 &&
    lineup.filter((p) => p.position === PlayerPosition.GOALKEEPER).length === 1;
  async function load() {
    setError("");
    try {
      const f = await fixturesApi.get(id);
      setFixture(f);
      setOpponent(f.opponentName);
      setKickoff(localDateTime(f.kickoffAt));
      setCompetition(f.competition);
      setLineup(f.lineup);
      setTicketPrice(f.ticketPrice === null ? "" : String(f.ticketPrice));
    } catch (e) {
      setError(fixtureError(e));
    }
  }
  useEffect(() => {
    void load();
    matchEventsSocket.connect();
  }, [id]);
  async function save(start = false) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const price = ticketPrice.trim() === "" ? null : Number(ticketPrice);
      const checkedPrice = TicketPriceSchema.nullable().safeParse(price);
      if (!checkedPrice.success) throw new Error(t("invalidTicketPrice"));
      const saved = await fixturesApi.update(id, {
        opponentName: opponent,
        kickoffAt: new Date(kickoff).toISOString(),
        competition,
        lineupIds: lineup.map((p) => p.id),
        ticketPrice: checkedPrice.data,
      });
      setFixture(saved);
      setLineup(saved.lineup);
      setNotice(t("saved"));
      if (start) {
        await matchEventsSocket.startMatch(id);
        router.push(`/${locale}/match-simulation`);
      }
    } catch (e) {
      setError(fixtureError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Link href={`/${locale}/fixtures`} className="underline">
        {t("back")}
      </Link>
      {error && (
        <div role="alert" className="text-destructive">
          {error}{" "}
          {!fixture && (
            <Button variant="outline" onClick={load}>
              {t("retry")}
            </Button>
          )}
        </div>
      )}
      {!fixture ? (
        !error && <p>{t("loading")}</p>
      ) : (
        <>
          <h1 className="text-3xl font-bold">
            {t("versus", { opponent: fixture.opponentName })}
          </h1>
          <p>{t(`statuses.${fixture.status}`)}</p>
          {fixture.status === "interrupted" && <p>{t("interruptedHelp")}</p>}
          {notice && <p role="status">{notice}</p>}
          {editable ? (
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
            >
              <FixtureFields
                {...{
                  opponent,
                  setOpponent,
                  kickoff,
                  setKickoff,
                  competition,
                  setCompetition,
                }}
                disabled={busy}
              />
              <LineupSelector
                selected={lineup}
                onChange={setLineup}
                disabled={busy}
              />
              <FixtureTicketing
                editable
                price={ticketPrice}
                onPriceChange={setTicketPrice}
                disabled={busy}
              />
              <div className="flex flex-wrap gap-3">
                <Button disabled={busy || (lineup.length > 0 && !ready)}>
                  {t("save")}
                </Button>
                <Button
                  type="button"
                  disabled={
                    busy ||
                    !ready ||
                    !isConnected ||
                    isMatchActive ||
                    !opponent.trim() ||
                    !kickoff ||
                    !competition.trim()
                  }
                  onClick={() => void save(true)}
                >
                  {t("start")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError("");
                    try {
                      setFixture(await fixturesApi.cancel(id));
                    } catch (e) {
                      setError(fixtureError(e));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {t("cancel")}
                </Button>
              </div>
              {!isConnected && <p role="status">{t("connecting")}</p>}
              {isMatchActive && (
                <Link
                  href={`/${locale}/match-simulation`}
                  className="underline"
                >
                  {t("watch")}
                </Link>
              )}
            </form>
          ) : (
            <>
              <p>
                {fixture.competition} ·{" "}
                {new Date(fixture.kickoffAt).toLocaleString(locale)}
              </p>
              {fixture.status === "in_progress" && (
                <Link
                  className="underline"
                  href={`/${locale}/match-simulation`}
                >
                  {t("watch")}
                </Link>
              )}
              {fixture.result && (
                <Link
                  className="underline"
                  href={`/${locale}/match-history/${fixture.id}`}
                >
                  {t("report")} · {fixture.result.score.home} –{" "}
                  {fixture.result.score.away}
                </Link>
              )}
              <ul>
                {fixture.lineup.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
              <FixtureTicketing
                matchday={fixture.matchday}
                completed={fixture.status === "completed"}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

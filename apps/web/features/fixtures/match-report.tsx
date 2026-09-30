"use client";

import { useLocale, useTranslations } from "next-intl";
import type { FixtureDto } from "@repo/core";
import {
  calculateMatchStats,
  getStatRows,
} from "@/features/match-events/utils/calculate-match-stats";
import { getEventIcon } from "@/features/match-events/utils";
import { FixtureTicketing } from "@/features/stadium/fixture-ticketing";

export function MatchReport({ fixture }: { fixture: FixtureDto }) {
  const t = useTranslations("MatchHistory");
  const eventText = useTranslations("MatchEvents");
  const positionText = useTranslations("Lineup");
  const locale = useLocale();
  const match = fixture.result;
  if (!match) return null;
  const stats = calculateMatchStats(match)!;
  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-6 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          {fixture.competition} ·{" "}
          {new Date(fixture.kickoffAt).toLocaleString(locale)}
        </p>
        <h1 className="text-2xl font-bold">
          {match.homeTeam.name} vs {match.awayTeam.name}
        </h1>
        <p className="text-5xl font-bold tabular-nums">
          {match.score.home} – {match.score.away}
        </p>
        <p>{t("fullTime")}</p>
        <p className="text-sm text-muted-foreground">{t("snapshot")}</p>
      </section>
      <FixtureTicketing matchday={fixture.matchday} completed />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold mb-4">{t("lineup")}</h2>
          <ul className="divide-y">
            {match.homeTeam.players.map((player) => (
              <li className="flex justify-between gap-3 py-2" key={player.id}>
                <span>
                  {player.jerseyNumber ? `${player.jerseyNumber}. ` : ""}
                  {player.name}
                </span>
                <span className="text-muted-foreground text-sm">
                  {positionText(`positions.${player.position}`)}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold mb-4">{t("statistics")}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2">{t("statistic")}</th>
                <th scope="col">{match.homeTeam.name}</th>
                <th scope="col">{match.awayTeam.name}</th>
              </tr>
            </thead>
            <tbody>
              {getStatRows(stats, eventText).map((row) => (
                <tr className="border-t" key={row.label}>
                  <th scope="row" className="py-3 text-left font-normal">
                    {row.label}
                  </th>
                  <td className="text-center font-semibold">{row.home}</td>
                  <td className="text-center font-semibold">{row.away}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
      <section className="rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-4">{t("timeline")}</h2>
        <ol className="divide-y">
          {match.events.map((event) => (
            <li key={event.id} className="flex items-start gap-4 py-3">
              <span className="w-10 shrink-0 font-semibold tabular-nums">
                {event.minute}′
              </span>
              <span aria-hidden="true">{getEventIcon(event.type)}</span>
              <div>
                <p className="font-medium">
                  {eventText(`eventTypes.${event.type}`)}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {event.teamName}
                  </span>
                </p>
                {event.player && <p className="text-sm">{event.player.name}</p>}
                {event.relatedPlayer && (
                  <p className="text-sm text-muted-foreground">
                    {t("assist", { name: event.relatedPlayer.name })}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

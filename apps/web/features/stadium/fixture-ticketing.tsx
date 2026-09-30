"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  forecastMatchday,
  TicketPriceSchema,
  type MatchdaySnapshot,
  type StadiumSettings,
} from "@repo/core";
import { stadiumApi } from "./api";
import { formatCurrency } from "@/utils/currency";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function FixtureTicketing({
  price = "",
  onPriceChange,
  disabled = false,
  editable = false,
  matchday = null,
  completed = false,
}: {
  price?: string;
  onPriceChange?: (value: string) => void;
  disabled?: boolean;
  editable?: boolean;
  matchday?: MatchdaySnapshot | null;
  completed?: boolean;
}) {
  const t = useTranslations("Ticketing");
  const locale = useLocale();
  const [stadium, setStadium] = useState<StadiumSettings | null>(null);
  const [loading, setLoading] = useState(editable);
  const [failed, setFailed] = useState(false);
  async function load() {
    setLoading(true);
    setFailed(false);
    try {
      setStadium(await stadiumApi.get());
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (editable) void load();
  }, [editable]);
  const parsed = TicketPriceSchema.safeParse(
    price.trim() === "" ? (stadium?.defaultTicketPrice ?? 0) : Number(price),
  );
  const forecast =
    editable && stadium && parsed.success
      ? forecastMatchday(stadium, parsed.data)
      : null;
  const data = editable ? forecast : matchday;
  const attendance = editable
    ? forecast?.expectedAttendance
    : matchday?.attendance;
  const revenue = editable
    ? forecast?.expectedRevenue
    : matchday?.ticketRevenue;
  const profit = editable
    ? forecast?.expectedProfit
    : matchday?.operatingProfit;
  return (
    <section className="rounded-xl border bg-card p-6 space-y-4">
      <h2 className="text-xl font-semibold">
        {t(editable ? "title" : completed ? "recordedTitle" : "kickoffTitle")}
      </h2>
      {editable && (
        <label className="block space-y-2 max-w-sm">
          {t("price")}
          <Input
            type="number"
            min={0}
            max={10000}
            step="0.01"
            value={price}
            disabled={disabled}
            placeholder={stadium ? String(stadium.defaultTicketPrice) : "—"}
            onChange={(e) => onPriceChange?.(e.target.value)}
          />
          <span className="block text-sm text-muted-foreground">
            {t("inherit")}
          </span>
        </label>
      )}
      {editable && !parsed.success && (
        <p role="alert" className="text-destructive">
          {t("invalidPrice")}
        </p>
      )}
      {loading && editable ? (
        <p role="status">{t("loading")}</p>
      ) : failed && editable ? (
        <div role="alert">
          {t("loadError")}{" "}
          <Button type="button" variant="outline" onClick={load}>
            {t("retry")}
          </Button>
        </div>
      ) : data ? (
        <>
          <p className="text-sm text-muted-foreground">
            {data.stadium.name} ·{" "}
            {t("capacity", { count: data.stadium.capacity })} ·{" "}
            {t("effectivePrice", { price: formatCurrency(data.ticketPrice) })}
          </p>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: t(editable ? "expectedAttendance" : "attendance"),
                value: attendance?.toLocaleString(locale),
              },
              {
                label: t(editable ? "expectedRevenue" : "revenue"),
                value: formatCurrency(revenue),
              },
              { label: t("costs"), value: formatCurrency(data.operatingCosts) },
              {
                label: t(editable ? "expectedProfit" : "profit"),
                value: formatCurrency(profit),
              },
            ].map((row) => (
              <div key={row.label} className="rounded-lg bg-muted p-4">
                <dt className="text-sm text-muted-foreground">{row.label}</dt>
                <dd className="text-xl font-semibold mt-1">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-muted-foreground">
            {t(editable ? "forecastHelp" : "snapshotHelp")}{" "}
            {t("maintenanceHelp")}
          </p>
        </>
      ) : (
        (!editable || !stadium) && (
          <p className="text-sm text-muted-foreground">
            {t(editable ? "setup" : "noSnapshot")}{" "}
            {editable && (
              <Link className="underline" href={`/${locale}/stadium`}>
                {t("settings")}
              </Link>
            )}
          </p>
        )
      )}
    </section>
  );
}

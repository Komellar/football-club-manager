"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { StadiumSettingsSchema, type StadiumSettings } from "@repo/core";
import { stadiumApi } from "@/features/stadium/api";
import { fixtureError } from "@/features/fixtures/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils/currency";

const initial: StadiumSettings = {
  name: "",
  capacity: 10000,
  defaultTicketPrice: 20,
  expectedOccupancy: 60,
  monthlyMaintenance: 0,
  securityCost: 0,
  staffingCost: 0,
  cleaningCost: 0,
  utilitiesCost: 0,
};
const fields = [
  "capacity",
  "defaultTicketPrice",
  "expectedOccupancy",
  "monthlyMaintenance",
  "securityCost",
  "staffingCost",
  "cleaningCost",
  "utilitiesCost",
] as const;
export default function StadiumPage() {
  const t = useTranslations("Stadium");
  const [settings, setSettings] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      setSettings((await stadiumApi.get()) || initial);
    } catch (e) {
      setError(fixtureError(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaved(false);
    const form = new FormData(e.currentTarget);
    const candidate = {
      name: form.get("name"),
      ...Object.fromEntries(fields.map((key) => [key, Number(form.get(key))])),
    };
    const parsed = StadiumSettingsSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(t("invalid"));
      return;
    }
    setBusy(true);
    try {
      setSettings(await stadiumApi.save(parsed.data));
      setSaved(true);
    } catch (e) {
      setError(fixtureError(e));
    } finally {
      setBusy(false);
    }
  }
  const costs =
    settings.securityCost +
    settings.staffingCost +
    settings.cleaningCost +
    settings.utilitiesCost;
  return (
    <div className="container mx-auto py-8 space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">{t("loading")}</p>
      ) : (
        <>
          <form
            onSubmit={submit}
            className="space-y-6"
            onChange={() => setSaved(false)}
          >
            <fieldset
              disabled={busy}
              className="grid gap-4 sm:grid-cols-2 rounded-xl border p-6"
            >
              <label className="space-y-2 sm:col-span-2">
                {t("name")}
                <Input
                  name="name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={settings.name}
                  onChange={(e) =>
                    setSettings({ ...settings, name: e.target.value })
                  }
                />
              </label>
              {fields.map((key) => (
                <label key={key} className="space-y-2">
                  {t(key)}
                  <Input
                    name={key}
                    required
                    type="number"
                    min={key === "capacity" ? 1 : 0}
                    max={
                      key === "capacity"
                        ? 1000000
                        : key === "expectedOccupancy"
                          ? 100
                          : key === "defaultTicketPrice"
                            ? 10000
                            : 10000000
                    }
                    step={key === "capacity" ? 1 : 0.01}
                    defaultValue={settings[key]}
                    key={`${key}-${settings[key]}`}
                  />
                </label>
              ))}
            </fieldset>
            <p className="text-sm text-muted-foreground">{t("costHelp")}</p>
            <Button disabled={busy} type="submit">
              {busy ? t("saving") : t("save")}
            </Button>
            {saved && (
              <p role="status">{t("saved", { cost: formatCurrency(costs) })}</p>
            )}
          </form>
          {error && (
            <Button variant="outline" onClick={load}>
              {t("retry")}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

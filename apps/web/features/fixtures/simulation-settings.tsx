"use client";
import { useTranslations } from "next-intl";
import type { MatchSettings, MatchTactic } from "@repo/core";
import { Input } from "@/components/ui/input";

export function SimulationSettings({
  value,
  onChange,
  disabled,
}: {
  value: MatchSettings;
  onChange: (settings: MatchSettings) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("Fixtures.simulation");
  return (
    <fieldset disabled={disabled} className="rounded-xl border p-4 space-y-4">
      <legend className="px-2 font-semibold">{t("title")}</legend>
      <p className="text-sm text-muted-foreground">{t("help")}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {(["homeStrength", "opponentStrength"] as const).map((field) => (
          <label key={field} className="space-y-2">
            <span>{t(field)}</span>
            <Input
              type="number"
              min={0.5}
              max={1.5}
              step={0.1}
              required
              value={value[field]}
              onChange={(event) =>
                onChange({ ...value, [field]: Number(event.target.value) })
              }
            />
          </label>
        ))}
        {(["homeTactic", "opponentTactic"] as const).map((field) => (
          <label key={field} className="space-y-2">
            <span>{t(field)}</span>
            <select
              value={value[field]}
              onChange={(event) =>
                onChange({
                  ...value,
                  [field]: event.target.value as MatchTactic,
                })
              }
              className="block w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {(["defensive", "balanced", "attacking"] as const).map(
                (tactic) => (
                  <option key={tactic} value={tactic}>
                    {t(tactic)}
                  </option>
                ),
              )}
            </select>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

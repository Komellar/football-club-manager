"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MatchEventPlayer, PlayerPosition } from "@repo/core";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export function LineupSelector({
  selected,
  onChange,
  disabled = false,
}: {
  selected: MatchEventPlayer[];
  onChange: (players: MatchEventPlayer[]) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("Lineup");
  const [players, setPlayers] = useState<MatchEventPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  async function load() {
    setLoading(true);
    setError(false);
    try {
      setPlayers(
        (await apiClient.get<MatchEventPlayer[]>("/match-lineup")).data,
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  const goalkeepers = selected.filter(
    (p) => p.position === PlayerPosition.GOALKEEPER,
  ).length;
  return (
    <section className="rounded-xl border bg-card p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("instruction")}</p>
      </div>
      <p role="status">
        {t("selected", { count: selected.length })} ·{" "}
        {t("goalkeepers", { count: goalkeepers })}
      </p>
      {loading ? (
        <p>{t("loading")}</p>
      ) : error ? (
        <div role="alert">
          {t("loadError")}{" "}
          <Button variant="outline" onClick={load}>
            {t("retry")}
          </Button>
        </div>
      ) : (
        <>
          {players.length < 11 && (
            <p role="alert" className="text-destructive">
              {t("notEnough")}
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.values(PlayerPosition).map((position) => (
              <fieldset key={position} className="space-y-2">
                <legend className="font-medium mb-2">
                  {t(`positions.${position}`)}
                </legend>
                {players
                  .filter((p) => p.position === position)
                  .map((player) => {
                    const checked = selected.some((p) => p.id === player.id);
                    return (
                      <label
                        key={player.id}
                        className={`flex items-center gap-3 border rounded-lg p-3 ${checked ? "border-primary bg-primary/5" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={
                            disabled ||
                            (!checked &&
                              (selected.length === 11 ||
                                (position === PlayerPosition.GOALKEEPER &&
                                  goalkeepers === 1)))
                          }
                          onChange={() =>
                            onChange(
                              checked
                                ? selected.filter((p) => p.id !== player.id)
                                : [...selected, player],
                            )
                          }
                        />
                        <span>
                          {player.jerseyNumber
                            ? `${player.jerseyNumber}. `
                            : ""}
                          {player.name}
                        </span>
                      </label>
                    );
                  })}
              </fieldset>
            ))}
          </div>
          <Button
            variant="outline"
            disabled={disabled || selected.length === 0}
            onClick={() => onChange([])}
          >
            {t("clear")}
          </Button>
        </>
      )}
    </section>
  );
}

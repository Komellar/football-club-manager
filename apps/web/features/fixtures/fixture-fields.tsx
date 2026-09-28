"use client";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";

export function FixtureFields({
  opponent,
  setOpponent,
  kickoff,
  setKickoff,
  competition,
  setCompetition,
  disabled = false,
}: {
  opponent: string;
  setOpponent: (value: string) => void;
  kickoff: string;
  setKickoff: (value: string) => void;
  competition: string;
  setCompetition: (value: string) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("Fixtures");
  return (
    <fieldset disabled={disabled} className="grid gap-4 md:grid-cols-3">
      <label className="space-y-2">
        {t("opponent")}
        <Input
          required
          minLength={2}
          maxLength={100}
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
        />
      </label>
      <label className="space-y-2">
        {t("kickoff")}
        <Input
          required
          type="datetime-local"
          value={kickoff}
          onChange={(e) => setKickoff(e.target.value)}
        />
      </label>
      <label className="space-y-2">
        {t("competition")}
        <Input
          required
          maxLength={100}
          value={competition}
          onChange={(e) => setCompetition(e.target.value)}
        />
      </label>
    </fieldset>
  );
}

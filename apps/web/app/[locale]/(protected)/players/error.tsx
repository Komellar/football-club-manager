"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PlayersError({ error, reset }: ErrorPageProps) {
  const t = useTranslations("Players");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("managePlayers")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">
            {t("somethingWentWrong")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="mb-4">
            <p className="text-muted-foreground mb-2">{t("errorLoading")}</p>
            <p className="text-sm text-gray-500">
              {error.message || "An unexpected error occurred"}
            </p>
          </div>
          <div className="space-x-2">
            <Button onClick={reset} variant="default">
              {t("tryAgain")}
            </Button>
            <Button
              onClick={() => (window.location.href = "/players")}
              variant="outline"
            >
              {t("backToPlayers")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PlayerError({ error, reset }: ErrorPageProps) {
  const t = useTranslations("Players");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 text-center">
            {t("somethingWentWrong")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center ">
          <div className="mb-4">
            <p className="text-gray-500">
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

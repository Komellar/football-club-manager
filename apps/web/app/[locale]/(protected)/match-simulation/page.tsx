"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { matchEventsSocket, MatchStatsCard } from "@/features/match-events";
import {
  MatchEventList,
  MatchScoreBoard,
  ConnectionStatus,
} from "@/features/match-events";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, AlertCircle } from "lucide-react";
import { startMatch } from "@/features/match-events/utils";

export default function MatchSimulationPage() {
  const t = useTranslations("MatchEvents");
  const [isInitialized, setIsInitialized] = useState(false);

  const { activeMatch, isConnected, isMatchActive, error } = useAppSelector(
    (state) => state.matchEvents
  );

  useEffect(() => {
    // Connect to Socket.IO when component mounts
    matchEventsSocket.connect();
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-muted-foreground">
          {t("connecting")}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("liveMatch")}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={startMatch}
            disabled={!isConnected || isMatchActive}
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            {activeMatch ? t("startNewMatch") : t("startMatch")}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ConnectionStatus />

      {activeMatch ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MatchScoreBoard />
          </div>

          <MatchStatsCard />

          <div className="lg:col-span-3">
            <MatchEventList />
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-4">{t("matchNotStarted")}</p>
              <p className="text-sm">{t("simulationInstruction")}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

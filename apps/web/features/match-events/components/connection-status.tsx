"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";
import { useAppSelector } from "@/store";

export function ConnectionStatus() {
  const t = useTranslations("MatchEvents");

  const { isConnected } = useAppSelector((state) => state.matchEvents);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("connectionStatus")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <Wifi className="h-5 w-5 text-green-500" />
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0"
              >
                {t("connected")}
              </Badge>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 text-red-500" />
              <Badge
                variant="outline"
                className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-0"
              >
                {t("disconnected")}
              </Badge>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

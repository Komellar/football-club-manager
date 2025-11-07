"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppSelector } from "@/store/hooks";
import { getEventColor, getEventIcon } from "../utils";
import { cn } from "@/lib/utils";
import { MatchEventType } from "@repo/core";

export function MatchEventList() {
  const t = useTranslations("MatchEvents");

  const { activeMatch } = useAppSelector((state) => state.matchEvents);

  if (!activeMatch) {
    return null;
  }

  const events = activeMatch.events;

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("timeline")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            {t("noEvents")}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Reverse events to show most recent first
  const sortedEvents = [...events].reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{t("timeline")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[1000px] pr-4">
          <div className="space-y-4">
            {sortedEvents.map((event, index) => (
              <div
                key={`${event.id}-${index}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border bg-card w-full",

                  event.teamId === activeMatch.homeTeam.id
                    ? "justify-start bg-primary/5"
                    : "justify-end bg-secondary/5",
                  (event.type === MatchEventType.MATCH_START ||
                    event.type === MatchEventType.HALF_TIME ||
                    event.type === MatchEventType.MATCH_END) &&
                    "justify-center bg-purple-100"
                )}
              >
                <div className="flex items-center justify-center w-12 h-12">
                  {getEventIcon(event.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={`${getEventColor(event.type)} border-0`}
                    >
                      {t(`eventTypes.${event.type}`)}
                    </Badge>
                    <span className="text-sm font-semibold">
                      {event.minute}'
                    </span>
                  </div>
                  {event.player && (
                    <div className="text-sm">
                      {event.player.name}
                      {event.player.jerseyNumber && (
                        <span className="ml-1">
                          #{event.player.jerseyNumber}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

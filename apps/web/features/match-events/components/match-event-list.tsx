"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppSelector } from "@/store/hooks";
import { getEventColor, getEventIcon, isAllowedToShowTeam } from "../utils";

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
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={`${getEventColor(event.type)} border-0`}
                    >
                      {t(`eventTypes.${event.type}`)}
                    </Badge>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {event.minute}'
                    </span>
                  </div>
                  {isAllowedToShowTeam(event.type) && (
                    <div className="text-sm font-medium mb-1">
                      {event.teamName}
                    </div>
                  )}
                  {event.player && (
                    <div className="text-sm text-muted-foreground">
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

import { Calendar, Flag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import {
  calculateAge,
  getCountryDisplayName,
  PlayerResponseDto,
  ValidCountry,
} from "@repo/core";
import { positionColors } from "@/features/players/constants";
import { formatPlayerPosition } from "@/features/players/utils";
import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";

interface PlayerAvatarProps {
  player: PlayerResponseDto;
}

export async function Avatar({ player }: PlayerAvatarProps) {
  const t = await getTranslations("Players");

  const age = calculateAge(player.dateOfBirth);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-48 h-48 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {player.imageUrl ? (
                <img
                  src={player.imageUrl}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-24 h-24 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{player.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className={positionColors[player.position]}
                >
                  {formatPlayerPosition(player.position)}
                </Badge>
                <Badge variant={player.isActive ? "default" : "secondary"}>
                  {player.isActive ? t("active") : t("inactive")}
                </Badge>
                {player.jerseyNumber && (
                  <Badge variant="outline">#{player.jerseyNumber}</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <div>
                  <div className="text-xs">{t("age")}</div>
                  <div className="text-sm font-medium text-foreground">
                    {age} {t("years")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Flag className="w-4 h-4" />
                <div>
                  <div className="text-xs">{t("country")}</div>
                  <div className="text-sm font-medium text-foreground">
                    {getCountryDisplayName(player.country as ValidCountry)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

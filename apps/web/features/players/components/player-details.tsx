"use client";

import { PlayerResponseDto, calculateAge } from "@repo/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/utils/currency";
import { formatPlayerPosition } from "../utils";
import { positionColors } from "../constants";
import {
  User,
  Calendar,
  Flag,
  Shirt,
  Ruler,
  Weight,
  DollarSign,
  Activity,
} from "lucide-react";

interface PlayerDetailsProps {
  player: PlayerResponseDto;
}

export function PlayerDetails({ player }: PlayerDetailsProps) {
  const t = useTranslations("Players");
  const age = calculateAge(player.dateOfBirth);

  return (
    <div className="space-y-6">
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
                    <div className="text-xs">{t("nationality")}</div>
                    <div className="text-sm font-medium text-foreground">
                      {player.nationality}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("sections.physicalAttributes")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {player.height && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Ruler className="w-4 h-4" />
                  <span>{t("height")}</span>
                </div>
                <span className="font-medium">{player.height} cm</span>
              </div>
            )}
            {player.weight && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Weight className="w-4 h-4" />
                  <span>{t("weight")}</span>
                </div>
                <span className="font-medium">{player.weight} kg</span>
              </div>
            )}
            {!player.height && !player.weight && (
              <p className="text-sm text-muted-foreground">
                {t("noPhysicalData")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("sections.teamInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {player.jerseyNumber && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shirt className="w-4 h-4" />
                  <span>{t("jerseyNumber")}</span>
                </div>
                <span className="font-medium">#{player.jerseyNumber}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="w-4 h-4" />
                <span>{t("status")}</span>
              </div>
              <Badge variant={player.isActive ? "default" : "secondary"}>
                {player.isActive ? t("active") : t("inactive")}
              </Badge>
            </div>
            {player.marketValue && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>{t("marketValue")}</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(player.marketValue)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("additionalInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("dateOfBirth")}</span>
            <span className="font-medium">
              {new Date(player.dateOfBirth).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("createdAt")}</span>
            <span className="font-medium">
              {new Date(player.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("updatedAt")}</span>
            <span className="font-medium">
              {new Date(player.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

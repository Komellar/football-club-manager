import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shirt, Activity, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/currency";
import { PlayerResponseDto } from "@repo/core";
import { getTranslations } from "next-intl/server";

interface TeamInfoProps {
  player: PlayerResponseDto;
}

export async function TeamInfo({ player }: TeamInfoProps) {
  const t = await getTranslations("Players");

  return (
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
  );
}

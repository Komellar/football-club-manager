import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Ruler, Weight } from "lucide-react";
import { PlayerResponseDto } from "@repo/core";
import { getTranslations } from "next-intl/server";

interface PhysicalProps {
  player: PlayerResponseDto;
}

export async function Physical({ player }: PhysicalProps) {
  const t = await getTranslations("Players");

  return (
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
          <p className="text-sm text-muted-foreground">{t("noPhysicalData")}</p>
        )}
      </CardContent>
    </Card>
  );
}

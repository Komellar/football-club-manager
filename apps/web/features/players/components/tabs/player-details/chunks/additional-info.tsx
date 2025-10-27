import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlayerResponseDto } from "@repo/core";
import { getTranslations } from "next-intl/server";

interface PlayerAdditionalInfoProps {
  player: PlayerResponseDto;
}

export async function AdditionalInfo({ player }: PlayerAdditionalInfoProps) {
  const t = await getTranslations("Players");

  return (
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
  );
}

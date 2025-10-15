import { PlayerResponseDto } from "@repo/core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { formatPlayerPosition } from "../../utils";
import { positionColors } from "../../constants";
import { getTranslations } from "next-intl/server";

interface PlayersTableProps {
  players: PlayerResponseDto[];
}

export async function PlayersTable({ players }: PlayersTableProps) {
  const t = await getTranslations("Players");

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("position")}</TableHead>
            <TableHead>{t("age")}</TableHead>
            <TableHead>{t("nationality")}</TableHead>
            <TableHead>{t("jerseyNumber")}</TableHead>
            <TableHead>{t("marketValue")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell className="font-medium">{player.name}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={positionColors[player.position]}
                >
                  {formatPlayerPosition(player.position)}
                </Badge>
              </TableCell>
              <TableCell>{player.age}</TableCell>
              <TableCell>{player.nationality}</TableCell>
              <TableCell>
                {player.jerseyNumber ? `#${player.jerseyNumber}` : "-"}
              </TableCell>
              <TableCell>
                {player.marketValue ? formatCurrency(player.marketValue) : "-"}
              </TableCell>
              <TableCell>
                <Badge variant={player.isActive ? "default" : "secondary"}>
                  {player.isActive
                    ? t("statusValues.active")
                    : t("statusValues.inactive")}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button variant="ghost" size="sm" title={t("view")}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title={t("edit")}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title={t("delete")}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

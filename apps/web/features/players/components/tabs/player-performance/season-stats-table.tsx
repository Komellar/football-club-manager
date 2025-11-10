import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlayerPosition, PlayerStatisticsResponseDto } from "@repo/core";
import { getSeasonStatsColumns, getTotalStatsBySeason } from "../../../utils";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

interface SeasonStatsTableProps {
  statistics: Record<string, PlayerStatisticsResponseDto[]>;
  position: PlayerPosition;
}

export async function SeasonStatsTable({
  statistics,
  position,
}: SeasonStatsTableProps) {
  const t = await getTranslations("Players.performanceTab.seasonStatsTable");
  const sortedStats = getTotalStatsBySeason(statistics);
  const columns = getSeasonStatsColumns(position);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("seasonStats")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col}>{t(col)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStats.map((stat) => (
              <TableRow key={stat.season}>
                {columns.map((col, index) => (
                  <TableCell
                    key={col}
                    className={cn(index === 0 && "font-medium")}
                  >
                    {stat[col]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

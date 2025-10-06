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
import { formatPlayerPosition } from "../utils";
import { positionColors } from "../constants";

interface PlayersTableProps {
  players: PlayerResponseDto[];
}

export function PlayersTable({ players }: PlayersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Nationality</TableHead>
            <TableHead>Jersey #</TableHead>
            <TableHead>Market Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                  {player.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
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

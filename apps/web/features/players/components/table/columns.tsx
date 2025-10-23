"use client";

import { ColumnDef } from "@tanstack/react-table";
import { calculateAge, PlayerResponseDto, PlayerSortColumn } from "@repo/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { formatPlayerPosition } from "../../utils";
import { positionColors } from "../../constants";
import { useTranslations } from "next-intl";
import { UseTableSortReturn } from "@/hooks";
import { SortableHeader } from "@/components/shared/data-table/sortable-header";
import { DeletePlayerDialog } from "../delete-player-dialog";
import Link from "next/link";

export const createPlayerColumns = (
  sortHook: UseTableSortReturn<PlayerSortColumn>
): ColumnDef<PlayerResponseDto>[] => {
  const t = useTranslations("Players");

  // Helper function to create sortable header
  const createSortableHeader =
    (labelKey: string, sortColumn: PlayerSortColumn) => () => (
      <SortableHeader
        label={t(labelKey)}
        sortState={sortHook.isSorted(sortColumn)}
        onSort={() => sortHook.toggleSort(sortColumn)}
      />
    );
  return [
    {
      accessorKey: "name",
      header: createSortableHeader("name", "name"),
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue("name")}</div>;
      },
    },
    {
      accessorKey: "position",
      header: createSortableHeader("position", "position"),
      cell: ({ row }) => {
        const position = row.getValue(
          "position"
        ) as PlayerResponseDto["position"];
        return (
          <Badge variant="secondary" className={positionColors[position]}>
            {formatPlayerPosition(position)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "dateOfBirth",
      header: createSortableHeader("age", "dateOfBirth"),
      cell: ({ row }) => {
        return <div>{calculateAge(row.getValue("dateOfBirth"))}</div>;
      },
    },
    {
      accessorKey: "nationality",
      header: t("nationality"),
      cell: ({ row }) => {
        return <div>{row.getValue("nationality")}</div>;
      },
    },
    {
      accessorKey: "jerseyNumber",
      header: t("jerseyNumber"),
      cell: ({ row }) => {
        const jerseyNumber = row.getValue("jerseyNumber") as number | undefined;
        return <div>{jerseyNumber ? `#${jerseyNumber}` : "-"}</div>;
      },
    },
    {
      accessorKey: "marketValue",
      header: createSortableHeader("marketValue", "marketValue"),
      cell: ({ row }) => {
        const marketValue = row.getValue("marketValue") as number | undefined;
        return <div>{marketValue ? formatCurrency(marketValue) : "-"}</div>;
      },
    },
    {
      accessorKey: "isActive",
      header: t("status"),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? t("active") : t("inactive")}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("actions")}</div>,
      cell: ({ row }) => {
        const player = row.original;

        return (
          <div className="flex items-center justify-end space-x-2">
            <Button variant="ghost" size="sm" title={t("view")}>
              <Eye className="h-4 w-4" />
            </Button>
            <Link href={`/players/${player.id}/edit`}>
              <Button variant="ghost" size="sm" title={t("edit")}>
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <DeletePlayerDialog playerId={player.id} playerName={player.name} />
          </div>
        );
      },
    },
  ];
};

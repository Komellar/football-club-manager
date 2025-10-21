"use client";

import { ColumnDef } from "@tanstack/react-table";
import { calculateAge, PlayerResponseDto } from "@repo/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { formatPlayerPosition } from "../../utils";
import { positionColors } from "../../constants";
import { useTranslations } from "next-intl";

export const createPlayerColumns = (): ColumnDef<PlayerResponseDto>[] => {
  const t = useTranslations("Players");
  return [
    {
      accessorKey: "name",
      header: t("name"),
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue("name")}</div>;
      },
    },
    {
      accessorKey: "position",
      header: t("position"),
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
      header: t("age"),
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
      header: t("marketValue"),
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
            <Button variant="ghost" size="sm" title={t("edit")}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title={t("delete")}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
};

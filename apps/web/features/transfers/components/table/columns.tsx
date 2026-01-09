"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TransferResponseDto, TransferSortColumn } from "@repo/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { dateToString } from "@/utils/date";
import {
  formatTransferType,
  formatTransferStatus,
  formatTransferDirection,
} from "../../utils";
import {
  transferTypeColors,
  transferStatusColors,
  transferDirectionColors,
} from "../../constants";
import { useTranslations } from "next-intl";
import { UseTableSortReturn } from "@/hooks";
import { SortableHeader } from "@/components/shared/data-table/sortable-header";
import Link from "next/link";
import { DeleteTransferDialog } from "../delete-transfer-dialog";

export const createTransferColumns = (
  sortHook: UseTableSortReturn<TransferSortColumn>
): ColumnDef<TransferResponseDto>[] => {
  const t = useTranslations("Transfers");

  const createSortableHeader =
    (labelKey: string, sortColumn: TransferSortColumn) => () => (
      <SortableHeader
        label={t(labelKey)}
        sortState={sortHook.isSorted(sortColumn)}
        onSort={() => sortHook.toggleSort(sortColumn)}
      />
    );

  return [
    {
      accessorKey: "playerId",
      header: t("player"),
      cell: ({ row }) => {
        const playerName = row.original.player?.name;
        const playerId = row.getValue("playerId") as number;
        return (
          <div className="font-medium">
            {playerName || `Player #${playerId}`}
          </div>
        );
      },
    },
    {
      accessorKey: "transferDirection",
      header: createSortableHeader("direction", "transferDirection"),
      cell: ({ row }) => {
        const direction = row.getValue(
          "transferDirection"
        ) as TransferResponseDto["transferDirection"];
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={transferDirectionColors[direction]}
            >
              {formatTransferDirection(direction)}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "otherClubName",
      header: createSortableHeader("club", "otherClubName"),
      cell: ({ row }) => {
        const clubName = row.getValue("otherClubName") as string | undefined;
        return <div>{clubName || "-"}</div>;
      },
    },
    {
      accessorKey: "transferType",
      header: createSortableHeader("type", "transferType"),
      cell: ({ row }) => {
        const type = row.getValue(
          "transferType"
        ) as TransferResponseDto["transferType"];
        return (
          <Badge variant="outline" className={transferTypeColors[type]}>
            {formatTransferType(type)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "transferDate",
      header: createSortableHeader("date", "transferDate"),
      cell: ({ row }) => {
        const date = row.getValue("transferDate") as Date;
        return <div>{dateToString(date)}</div>;
      },
    },
    {
      accessorKey: "transferFee",
      header: createSortableHeader("fee", "transferFee"),
      cell: ({ row }) => {
        const fee = row.getValue("transferFee") as number | undefined;
        return <div>{fee ? formatCurrency(fee) : "-"}</div>;
      },
    },
    {
      accessorKey: "transferStatus",
      header: createSortableHeader("status", "transferStatus"),
      cell: ({ row }) => {
        const status = row.getValue(
          "transferStatus"
        ) as TransferResponseDto["transferStatus"];
        return (
          <Badge variant="outline" className={transferStatusColors[status]}>
            {formatTransferStatus(status)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div>{t("actions")}</div>,
      cell: ({ row }) => {
        const transfer = row.original;
        const playerName = transfer.player?.name || `Player #${transfer.playerId}`;

        return (
          <div className="flex justify-start gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/transfers/${transfer.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/transfers/${transfer.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <DeleteTransferDialog
              transferId={transfer.id}
              playerName={playerName}
            />
          </div>
        );
      },
    },
  ];
};

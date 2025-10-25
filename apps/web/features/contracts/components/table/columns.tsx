"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ContractResponseDto, ContractSortColumn } from "@repo/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useTranslations } from "next-intl";
import { UseTableSortReturn } from "@/hooks";
import { SortableHeader } from "@/components/shared/data-table/sortable-header";
import Link from "next/link";
import { contractStatusColors, contractTypeColors } from "../../constants";
import {
  formatContractType,
  formatContractStatus,
  isContractExpiringSoon,
} from "../../utils";

export const createContractColumns = (
  sortHook: UseTableSortReturn<ContractSortColumn>
): ColumnDef<ContractResponseDto>[] => {
  const t = useTranslations("Contracts");

  const createSortableHeader =
    (labelKey: string, sortColumn: ContractSortColumn) => () => (
      <SortableHeader
        label={t(labelKey)}
        sortState={sortHook.isSorted(sortColumn)}
        onSort={() => sortHook.toggleSort(sortColumn)}
      />
    );

  return [
    {
      accessorKey: "player",
      header: t("player"),
      cell: ({ row }) => {
        const player = row.getValue("player") as ContractResponseDto["player"];
        return (
          <div className="font-medium">
            {player ? (
              <Link href={`/players/${player.id}`} className="hover:underline">
                {player.name}{" "}
              </Link>
            ) : (
              "-"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "contractType",
      header: createSortableHeader("contractType", "contractType"),
      cell: ({ row }) => {
        const contractType = row.getValue(
          "contractType"
        ) as ContractResponseDto["contractType"];
        return (
          <Badge
            variant="secondary"
            className={contractTypeColors[contractType]}
          >
            {formatContractType(contractType)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: createSortableHeader("status", "status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as ContractResponseDto["status"];
        return (
          <Badge variant="secondary" className={contractStatusColors[status]}>
            {formatContractStatus(status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: createSortableHeader("startDate", "startDate"),
      cell: ({ row }) => {
        const startDate = row.getValue("startDate") as Date;
        return (
          <div>
            {new Date(startDate).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "endDate",
      header: createSortableHeader("endDate", "endDate"),
      cell: ({ row }) => {
        const endDate = row.getValue("endDate") as Date;
        const expiringSoon = isContractExpiringSoon(endDate);

        return (
          <div className="flex items-center gap-2">
            <span>
              {new Date(endDate).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            {expiringSoon && (
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "salary",
      header: createSortableHeader("salary", "salary"),
      cell: ({ row }) => {
        const salary = row.getValue("salary") as number;
        return <div>{formatCurrency(salary)}</div>;
      },
    },
    {
      accessorKey: "bonuses",
      header: createSortableHeader("bonuses", "bonuses"),
      cell: ({ row }) => {
        const bonuses = row.getValue("bonuses") as number;
        return <div>{formatCurrency(bonuses)}</div>;
      },
    },
    {
      accessorKey: "releaseClause",
      header: createSortableHeader("releaseClause", "releaseClause"),
      cell: ({ row }) => {
        const releaseClause = row.getValue("releaseClause") as number;
        return <div>{formatCurrency(releaseClause)}</div>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("actions")}</div>,
      cell: ({ row }) => {
        const contract = row.original;

        return (
          <div className="flex items-center justify-end space-x-2">
            <Link href={`/contracts/${contract.id}`}>
              <Button variant="ghost" size="sm" title={t("view")}>
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/contracts/${contract.id}/edit`}>
              <Button variant="ghost" size="sm" title={t("edit")}>
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];
};

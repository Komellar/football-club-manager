"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SponsorshipResponseDto, SponsorshipSortColumn } from "@repo/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { dateToString } from "@/utils/date";
import { formatSponsorshipType, formatSponsorshipStatus } from "../../utils";
import {
  sponsorshipTypeColors,
  sponsorshipStatusColors,
} from "../../constants";
import { useTranslations } from "next-intl";
import { UseTableSortReturn } from "@/hooks";
import { SortableHeader } from "@/components/shared/data-table/sortable-header";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DeleteSponsorshipDialog } from "../delete-sponsorship-dialog";

export const createSponsorshipColumns = (
  sortHook: UseTableSortReturn<SponsorshipSortColumn>
): ColumnDef<SponsorshipResponseDto>[] => {
  const t = useTranslations("Sponsorships");
  const { locale } = useParams();

  const createSortableHeader =
    (labelKey: string, sortColumn: SponsorshipSortColumn) => () => (
      <SortableHeader
        label={t(labelKey)}
        sortState={sortHook.isSorted(sortColumn)}
        onSort={() => sortHook.toggleSort(sortColumn)}
      />
    );

  return [
    {
      accessorKey: "sponsorName",
      header: createSortableHeader("sponsorName", "sponsorName"),
      cell: ({ row }) => {
        const sponsorName = row.getValue("sponsorName") as string;
        return <div className="font-medium">{sponsorName}</div>;
      },
    },
    {
      accessorKey: "sponsorshipType",
      header: createSortableHeader("type", "sponsorshipType"),
      cell: ({ row }) => {
        const type = row.getValue(
          "sponsorshipType"
        ) as SponsorshipResponseDto["sponsorshipType"];
        return (
          <Badge variant="outline" className={sponsorshipTypeColors[type]}>
            {formatSponsorshipType(type)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "sponsorshipStatus",
      header: createSortableHeader("status", "sponsorshipStatus"),
      cell: ({ row }) => {
        const status = row.getValue(
          "sponsorshipStatus"
        ) as SponsorshipResponseDto["sponsorshipStatus"];
        return (
          <Badge variant="outline" className={sponsorshipStatusColors[status]}>
            {formatSponsorshipStatus(status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: createSortableHeader("startDate", "startDate"),
      cell: ({ row }) => {
        const date = row.getValue("startDate") as Date;
        return <div>{dateToString(date)}</div>;
      },
    },
    {
      accessorKey: "endDate",
      header: createSortableHeader("endDate", "endDate"),
      cell: ({ row }) => {
        const date = row.getValue("endDate") as Date;
        return <div>{dateToString(date)}</div>;
      },
    },
    {
      accessorKey: "annualValue",
      header: createSortableHeader("annualValue", "annualValue"),
      cell: ({ row }) => {
        const value = row.getValue("annualValue") as number;
        return <div className="font-medium">{formatCurrency(value)}</div>;
      },
    },
    {
      accessorKey: "isActive",
      header: t("active"),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? t("yes") : t("no")}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div>{t("actions")}</div>,
      cell: ({ row }) => {
        const sponsorship = row.original;

        return (
          <div className="flex justify-start gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/${locale}/sponsorships/${sponsorship.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/${locale}/sponsorships/${sponsorship.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <DeleteSponsorshipDialog
              sponsorshipId={sponsorship.id}
              sponsorName={sponsorship.sponsorName}
            />
          </div>
        );
      },
    },
  ];
};

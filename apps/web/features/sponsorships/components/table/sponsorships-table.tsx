"use client";

import {
  PaginatedSponsorshipResponseDto,
  SortOrder,
  SponsorshipSortColumn,
} from "@repo/core";
import { DataTable } from "@/components/shared/data-table/data-table";
import { createSponsorshipColumns } from "./columns";
import { TablePagination } from "@/components/shared/data-table/table-pagination";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTableSort } from "@/hooks";
import { TableSearchInput } from "@/components/shared/data-table/table-search-input";
import { SponsorshipsFilterDrawer } from "./sponsorships-filter-drawer";
import { useParams } from "next/navigation";

interface SponsorshipsTableProps {
  sponsorshipsData: PaginatedSponsorshipResponseDto;
}

export function SponsorshipsTable({
  sponsorshipsData,
}: SponsorshipsTableProps) {
  const t = useTranslations("Sponsorships");
  const params = useParams();
  const locale = params.locale as string;
  const { data: sponsorships, pagination } = sponsorshipsData;

  const sortHook = useTableSort<SponsorshipSortColumn>({
    defaultSort: { by: "createdAt", order: SortOrder.DESC },
  });

  const columns = createSponsorshipColumns(sortHook);

  if (sponsorships.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <SponsorshipsFilterDrawer />
          <TableSearchInput placeholder={t("placeholders.searchBySponsor")} />
        </div>
        <div className="text-center p-10">
          <p className="text-muted-foreground mb-4">
            {t("noSponsorshipsMessage")}
          </p>
          <Button asChild>
            <Link href={`/${locale}/sponsorships/new`}>
              <Plus className="h-4 w-4 mr-2" />
              {t("addSponsorship")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <SponsorshipsFilterDrawer />
        <TableSearchInput placeholder={t("placeholders.searchBySponsor")} />
      </div>
      <DataTable
        columns={columns}
        data={sponsorships}
        noResultsMessage={t("noSponsorshipsFound")}
      />
      <TablePagination pagination={pagination} />
    </div>
  );
}

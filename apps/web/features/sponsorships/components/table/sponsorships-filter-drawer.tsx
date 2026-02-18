"use client";

import { useTranslations } from "next-intl";
import {
  SponsorshipListFiltersSchema,
  SponsorshipStatus,
  SponsorshipType,
} from "@repo/core";
import {
  SPONSORSHIP_STATUS_OPTIONS,
  SPONSORSHIP_TYPE_OPTIONS,
} from "../../constants";
import { useTableFilters } from "@/hooks";
import { FilterDrawer } from "@/components/shared/data-table/filter-drawer";
import { FilterSelect } from "@/components/shared/data-table/filter-select";
import { updateFilter } from "@/utils/table/drawer";

export function SponsorshipsFilterDrawer() {
  const t = useTranslations("Sponsorships");

  const filterHook = useTableFilters({
    schema: SponsorshipListFiltersSchema,
  });

  return (
    <FilterDrawer
      filterHook={filterHook}
      title={t("filters")}
      description={t("filterSponsorshipsDescription")}
    >
      {({ filters, setFilters }) => {
        return (
          <>
            {/* Sponsorship Type Filter */}
            <FilterSelect
              id="type-filter"
              label={t("type")}
              value={filters.sponsorshipType}
              placeholder={t("allTypes")}
              options={SPONSORSHIP_TYPE_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              onValueChange={(value) =>
                updateFilter(
                  setFilters,
                  "sponsorshipType",
                  value as SponsorshipType
                )
              }
              onClear={() =>
                updateFilter(setFilters, "sponsorshipType", undefined)
              }
            />

            {/* Sponsorship Status Filter */}
            <FilterSelect
              id="status-filter"
              label={t("status")}
              value={filters.sponsorshipStatus}
              placeholder={t("allStatuses")}
              options={SPONSORSHIP_STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              onValueChange={(value) =>
                updateFilter(
                  setFilters,
                  "sponsorshipStatus",
                  value as SponsorshipStatus
                )
              }
              onClear={() =>
                updateFilter(setFilters, "sponsorshipStatus", undefined)
              }
            />
          </>
        );
      }}
    </FilterDrawer>
  );
}

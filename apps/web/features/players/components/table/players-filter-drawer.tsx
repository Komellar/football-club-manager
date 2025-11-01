"use client";

import { useTranslations } from "next-intl";
import {
  PlayerPosition,
  ValidCountry,
  PlayerListFiltersSchema,
} from "@repo/core";
import {
  NATIONALITY_OPTIONS,
  POSITION_OPTIONS,
  STATUS_OPTIONS,
} from "../../constants/player-form-constants";
import { useTableFilters } from "@/hooks";
import { FilterDrawer } from "@/components/shared/data-table/filter-drawer";
import { FilterSelect } from "@/components/shared/data-table/filter-select";
import { updateFilter } from "@/utils/table/drawer";
import { FilterSearchableSelect } from "@/components/shared/data-table/filter-searchable-select";

export function PlayersFilterDrawer() {
  const t = useTranslations("Players");

  const filterHook = useTableFilters({
    schema: PlayerListFiltersSchema,
  });

  return (
    <FilterDrawer
      filterHook={filterHook}
      title={t("filters")}
      description={t("filterPlayersDescription")}
    >
      {({ filters, setFilters }) => {
        return (
          <>
            {/* Position Filter */}
            <FilterSelect
              id="position-filter"
              label={t("position")}
              value={filters.position}
              placeholder={t("allPositions")}
              options={POSITION_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              onValueChange={(value) =>
                updateFilter(setFilters, "position", value as PlayerPosition)
              }
              onClear={() => updateFilter(setFilters, "position", undefined)}
            />

            {/* Status Filter */}
            <FilterSelect
              id="status-filter"
              label={t("status")}
              value={
                filters.isActive === undefined
                  ? undefined
                  : filters.isActive
                    ? "true"
                    : "false"
              }
              placeholder={t("allStatuses")}
              options={STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              onValueChange={(value) =>
                updateFilter(setFilters, "isActive", value === "true")
              }
              onClear={() => updateFilter(setFilters, "isActive", undefined)}
            />

            {/* Country Filter */}
            <FilterSearchableSelect
              id="country-filter"
              label={t("country")}
              placeholder={t("allCountries")}
              options={NATIONALITY_OPTIONS}
              value={filters.country}
              onValueChange={(value) =>
                updateFilter(setFilters, "country", value as ValidCountry)
              }
              onClear={() => updateFilter(setFilters, "country", undefined)}
            />
          </>
        );
      }}
    </FilterDrawer>
  );
}

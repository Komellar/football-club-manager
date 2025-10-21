"use client";

import { useTranslations } from "next-intl";
import {
  PlayerPosition,
  ValidNationality,
  PlayerListFilters,
} from "@repo/core";
import {
  NATIONALITY_OPTIONS,
  POSITION_OPTIONS,
  STATUS_OPTIONS,
} from "../../constants/player-form-constants";
import { UseTableFiltersReturn } from "@/hooks";
import { FilterDrawer } from "@/components/shared/data-table/filter-drawer";
import { FilterSelect } from "@/components/shared/data-table/filter-select";
import { updateFilter } from "@/utils/table/drawer";

interface PlayersFilterDrawerProps {
  filterHook: UseTableFiltersReturn<PlayerListFilters>;
}

export function PlayersFilterDrawer({ filterHook }: PlayersFilterDrawerProps) {
  const t = useTranslations("Players");

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

            {/* Nationality Filter */}
            <FilterSelect
              id="nationality-filter"
              label={t("nationality")}
              value={filters.nationality}
              placeholder={t("allNationalities") || "All Nationalities"}
              options={NATIONALITY_OPTIONS}
              onValueChange={(value) =>
                updateFilter(
                  setFilters,
                  "nationality",
                  value as ValidNationality
                )
              }
              onClear={() => updateFilter(setFilters, "nationality", undefined)}
            />
          </>
        );
      }}
    </FilterDrawer>
  );
}

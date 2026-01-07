"use client";

import { useTranslations } from "next-intl";
import {
  TransferDirection,
  TransferListFiltersSchema,
  TransferStatus,
  TransferType,
} from "@repo/core";
import {
  TRANSFER_DIRECTION_OPTIONS,
  TRANSFER_STATUS_OPTIONS,
  TRANSFER_TYPE_OPTIONS,
} from "../../constants/filters";
import { useTableFilters } from "@/hooks";
import { FilterDrawer } from "@/components/shared/data-table/filter-drawer";
import { FilterSelect } from "@/components/shared/data-table/filter-select";
import { updateFilter } from "@/utils/table/drawer";

export function TransfersFilterDrawer() {
  const t = useTranslations("Transfers");

  const filterHook = useTableFilters({
    schema: TransferListFiltersSchema,
  });

  return (
    <FilterDrawer
      filterHook={filterHook}
      title={t("filters")}
      description={t("filterTransfersDescription")}
    >
      {({ filters, setFilters }) => {
        return (
          <>
            {/* Transfer Direction Filter */}
            <FilterSelect
              id="direction-filter"
              label={t("direction")}
              value={filters.transferDirection}
              placeholder={t("allDirections")}
              options={TRANSFER_DIRECTION_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              onValueChange={(value) =>
                updateFilter(
                  setFilters,
                  "transferDirection",
                  value as TransferDirection
                )
              }
              onClear={() =>
                updateFilter(setFilters, "transferDirection", undefined)
              }
            />

            {/* Transfer Type Filter */}
            <FilterSelect
              id="type-filter"
              label={t("type")}
              value={filters.transferType}
              placeholder={t("allTypes")}
              options={TRANSFER_TYPE_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              onValueChange={(value) =>
                updateFilter(setFilters, "transferType", value as TransferType)
              }
              onClear={() =>
                updateFilter(setFilters, "transferType", undefined)
              }
            />

            {/* Transfer Status Filter */}
            <FilterSelect
              id="status-filter"
              label={t("status")}
              value={filters.transferStatus}
              placeholder={t("allStatuses")}
              options={TRANSFER_STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              onValueChange={(value) =>
                updateFilter(
                  setFilters,
                  "transferStatus",
                  value as TransferStatus
                )
              }
              onClear={() =>
                updateFilter(setFilters, "transferStatus", undefined)
              }
            />
          </>
        );
      }}
    </FilterDrawer>
  );
}

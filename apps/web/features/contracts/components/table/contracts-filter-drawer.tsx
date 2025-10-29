"use client";

import { useTranslations } from "next-intl";
import {
  ContractStatus,
  ContractType,
  ContractListFilters,
  ContractListFiltersSchema,
} from "@repo/core";
import { useTableFilters } from "@/hooks";
import { FilterDrawer } from "@/components/shared/data-table/filter-drawer";
import { FilterSelect } from "@/components/shared/data-table/filter-select";
import { updateFilter } from "@/utils/table/drawer";
import {
  CONTRACT_STATUS_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
} from "../../constants/contract-form-constants";

export function ContractsFilterDrawer() {
  const t = useTranslations("Contracts");

  const filterHook = useTableFilters<typeof ContractListFiltersSchema>({
    schema: ContractListFiltersSchema,
  });

  return (
    <FilterDrawer<ContractListFilters>
      filterHook={filterHook}
      title={t("filters")}
      description={t("filterContractsDescription")}
    >
      {({ filters, setFilters }) => {
        return (
          <>
            {/* Contract Type Filter */}
            <FilterSelect
              id="contract-type-filter"
              label={t("contractType")}
              value={filters.contractType}
              placeholder={t("allContractTypes")}
              options={CONTRACT_TYPE_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              onValueChange={(value) =>
                updateFilter<ContractListFilters, "contractType">(
                  setFilters,
                  "contractType",
                  value as ContractType
                )
              }
              onClear={() =>
                updateFilter<ContractListFilters, "contractType">(
                  setFilters,
                  "contractType",
                  undefined
                )
              }
            />

            {/* Status Filter */}
            <FilterSelect
              id="status-filter"
              label={t("status")}
              value={filters.status}
              placeholder={t("allStatuses")}
              options={CONTRACT_STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              onValueChange={(value) =>
                updateFilter<ContractListFilters, "status">(
                  setFilters,
                  "status",
                  value as ContractStatus
                )
              }
              onClear={() =>
                updateFilter<ContractListFilters, "status">(
                  setFilters,
                  "status",
                  undefined
                )
              }
            />
          </>
        );
      }}
    </FilterDrawer>
  );
}

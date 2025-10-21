import qs from "qs";
import { ZodObject, ZodRawShape } from "zod";

export function parseFiltersFromQuery<T extends ZodRawShape>(
  searchParams: string | Record<string, unknown>,
  schema: ZodObject<T>
): Record<string, unknown> {
  try {
    const parsed =
      typeof searchParams === "string"
        ? qs.parse(searchParams, { ignoreQueryPrefix: true })
        : searchParams;

    // Validate with schema (partial to allow incomplete filters)
    const result = schema.partial().safeParse(parsed.where || {});

    if (result.success) {
      return result.data;
    }

    return {};
  } catch (error) {
    console.error("Failed to parse filters from query:", error);
    return {};
  }
}

export function serializeFiltersToQuery<T extends Record<string, unknown>>(
  filters: Partial<T>
): string {
  const cleanFilters = Object.entries(filters).reduce(
    (acc, [key, value]) => {
      // Allow false values, but skip undefined, null, and empty strings
      if (value === undefined || value === null || value === "") return acc;
      acc[key] = value;

      return acc;
    },
    {} as Record<string, unknown>
  );

  if (Object.keys(cleanFilters).length === 0) {
    return "";
  }

  return qs.stringify(
    { where: cleanFilters },
    {
      encode: true,
      arrayFormat: "brackets",
      skipNulls: true,
      allowEmptyArrays: false,
    }
  );
}

export function updateQueryWithFilters<T extends Record<string, unknown>>(
  currentParams: URLSearchParams,
  filters: Partial<T>
): string {
  const params = qs.parse(currentParams.toString());

  delete params.where;
  delete params.page;

  // Add new filters
  const filterQuery = serializeFiltersToQuery(filters);
  const filterParams = qs.parse(filterQuery);

  const merged = { ...params, ...filterParams };

  return qs.stringify(merged, {
    encode: true,
    arrayFormat: "brackets",
    skipNulls: true,
  });
}

export function hasActiveFilters<T extends Record<string, unknown>>(
  filters: Partial<T>
): boolean {
  return Object.values(filters).some((value) => {
    if (value === undefined || value === null || value === "") {
      return false;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return true;
  });
}

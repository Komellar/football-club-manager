import qs from "qs";

/**
 * Parse Next.js searchParams into a structured object using qs.
 * Handles bracket notation like where[key]=value properly.
 */
export function parseSearchParams(
  searchParams?: Record<string, string | string[]>
): Record<string, any> {
  if (!searchParams) return {};

  // Build query string from searchParams
  const queryString = new URLSearchParams(
    Object.entries(searchParams).reduce(
      (acc, [k, v]) => {
        if (typeof k === "string" && typeof v === "string") {
          acc[k] = v;
        } else if (Array.isArray(v) && typeof v[0] === "string") {
          acc[k] = v[0];
        }
        return acc;
      },
      {} as Record<string, string>
    )
  ).toString();

  // Parse with qs to handle bracket notation (e.g., where[key]=value)
  return qs.parse(queryString);
}

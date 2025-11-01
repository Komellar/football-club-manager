import {
  UEFA_CODES,
  CONMEBOL_CODES,
  CONCACAF_CODES,
  CAF_CODES,
  AFC_CODES,
  OFC_CODES,
  VALID_NATIONALITIES,
} from "../constants/confederations";
import { NATIONALITY_DISPLAY_NAMES } from "../constants/country-names";
import type { ValidCountry, Confederation } from "../types/country";

export type { ValidCountry, Confederation };

export function isValidCountry(country: string): country is ValidCountry {
  return VALID_NATIONALITIES.includes(country.toUpperCase() as ValidCountry);
}

export function getCountryDisplayName(country: ValidCountry): string {
  const upperCountry =
    country.toUpperCase() as keyof typeof NATIONALITY_DISPLAY_NAMES;
  return NATIONALITY_DISPLAY_NAMES[upperCountry] || country.toUpperCase();
}

// Lazy-initialized confederation lookup map
let confederationMap: Map<string, string> | null = null;

function getConfederationMap(): Map<string, string> {
  if (!confederationMap) {
    confederationMap = new Map<string, string>();

    // Populate the map with type safety
    UEFA_CODES.forEach((code) => confederationMap!.set(code, "UEFA"));
    CONMEBOL_CODES.forEach((code) => confederationMap!.set(code, "CONMEBOL"));
    CONCACAF_CODES.forEach((code) => confederationMap!.set(code, "CONCACAF"));
    CAF_CODES.forEach((code) => confederationMap!.set(code, "CAF"));
    AFC_CODES.forEach((code) => confederationMap!.set(code, "AFC"));
    OFC_CODES.forEach((code) => confederationMap!.set(code, "OFC"));
  }

  return confederationMap;
}

export function getConfederation(country: string): Confederation | "Unknown" {
  const code = country.toUpperCase();
  return (getConfederationMap().get(code) as Confederation) ?? "Unknown";
}

export function getCountriesByConfederation(
  confederation: string
): readonly string[] {
  switch (confederation.toUpperCase()) {
    case "UEFA":
      return UEFA_CODES;
    case "CONMEBOL":
      return CONMEBOL_CODES;
    case "CONCACAF":
      return CONCACAF_CODES;
    case "CAF":
      return CAF_CODES;
    case "AFC":
      return AFC_CODES;
    case "OFC":
      return OFC_CODES;
    default:
      return [];
  }
}

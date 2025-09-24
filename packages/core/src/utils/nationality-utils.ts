import {
  UEFA_CODES,
  CONMEBOL_CODES,
  CONCACAF_CODES,
  CAF_CODES,
  AFC_CODES,
  OFC_CODES,
  VALID_NATIONALITIES,
  ValidNationality,
  Confederation,
} from "../constants/confederations";
import { NATIONALITY_DISPLAY_NAMES } from "../constants/nationality-names";

export type { ValidNationality, Confederation };

export function isValidNationality(
  nationality: string
): nationality is ValidNationality {
  return VALID_NATIONALITIES.includes(
    nationality.toUpperCase() as ValidNationality
  );
}

export function getNationalityDisplayName(
  nationality: ValidNationality
): string {
  return (
    NATIONALITY_DISPLAY_NAMES[nationality.toUpperCase()] ||
    nationality.toUpperCase()
  );
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

export function getConfederation(
  nationality: string
): Confederation | "Unknown" {
  const code = nationality.toUpperCase();
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

import {
  UEFA_CODES,
  CONMEBOL_CODES,
  CONCACAF_CODES,
  CAF_CODES,
  AFC_CODES,
  OFC_CODES,
  VALID_NATIONALITIES,
} from "../constants/confederations";

// Type definitions for FIFA confederations
export type UefaCode = (typeof UEFA_CODES)[number];
export type ConmebolCode = (typeof CONMEBOL_CODES)[number];
export type ConcacafCode = (typeof CONCACAF_CODES)[number];
export type CafCode = (typeof CAF_CODES)[number];
export type AfcCode = (typeof AFC_CODES)[number];
export type OfcCode = (typeof OFC_CODES)[number];
export type ValidNationality = (typeof VALID_NATIONALITIES)[number];

// Confederation type union
export type Confederation =
  | "UEFA"
  | "CONMEBOL"
  | "CONCACAF"
  | "CAF"
  | "AFC"
  | "OFC";

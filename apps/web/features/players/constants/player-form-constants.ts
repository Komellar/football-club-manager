import {
  CreatePlayerDto,
  PlayerPosition,
  VALID_NATIONALITIES,
  ValidCountry,
  NATIONALITY_DISPLAY_NAMES,
} from "@repo/core";

export const POSITION_OPTIONS = [
  { value: PlayerPosition.GOALKEEPER, labelKey: "goalkeeper" },
  { value: PlayerPosition.DEFENDER, labelKey: "defender" },
  { value: PlayerPosition.MIDFIELDER, labelKey: "midfielder" },
  { value: PlayerPosition.FORWARD, labelKey: "forward" },
];

export const STATUS_OPTIONS = [
  { value: "true", labelKey: "statusValues.active" },
  { value: "false", labelKey: "statusValues.inactive" },
];

export const POPULAR_NATIONALITIES: ValidCountry[] = [
  "ENG",
  "ESP",
  "FRA",
  "DEU",
  "ITA",
  "NLD",
  "PRT",
  "BRA",
  "ARG",
  "MEX",
];

export const NATIONALITY_OPTIONS: { value: ValidCountry; label: string }[] = [
  ...POPULAR_NATIONALITIES.map((code) => ({
    value: code,
    label: NATIONALITY_DISPLAY_NAMES[code],
  })),
  ...VALID_NATIONALITIES.filter((code) => !POPULAR_NATIONALITIES.includes(code))
    .map((code) => ({
      value: code,
      label: NATIONALITY_DISPLAY_NAMES[code],
    }))
    .sort((a, b) => a.label.localeCompare(b.label)),
];

export const DEFAULT_FORM_VALUES: Partial<CreatePlayerDto> = {
  name: "",
  isActive: true,
};

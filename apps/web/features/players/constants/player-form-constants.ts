import {
  CreatePlayerDto,
  PlayerPosition,
  VALID_NATIONALITIES,
  ValidNationality,
  NATIONALITY_DISPLAY_NAMES,
} from "@repo/core";

export const POSITION_OPTIONS = [
  { value: PlayerPosition.GOALKEEPER, label: "Goalkeeper" },
  { value: PlayerPosition.DEFENDER, label: "Defender" },
  { value: PlayerPosition.MIDFIELDER, label: "Midfielder" },
  { value: PlayerPosition.FORWARD, label: "Forward" },
];

export const POPULAR_NATIONALITIES: ValidNationality[] = [
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

export const NATIONALITY_OPTIONS: { value: ValidNationality; label: string }[] =
  [
    ...POPULAR_NATIONALITIES.map((code) => ({
      value: code,
      label: NATIONALITY_DISPLAY_NAMES[code],
    })),
    ...VALID_NATIONALITIES.filter(
      (code) => !POPULAR_NATIONALITIES.includes(code)
    )
      .map((code) => ({
        value: code,
        label: NATIONALITY_DISPLAY_NAMES[code],
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];

export const DEFAULT_FORM_VALUES: Partial<CreatePlayerDto> = {
  name: "",
  isActive: false,
};

import {
  CreatePlayerDto,
  PlayerPosition,
  VALID_NATIONALITIES,
  ValidNationality,
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
    ...POPULAR_NATIONALITIES.map((code) => ({ value: code, label: code })),
    ...VALID_NATIONALITIES.filter(
      (code) => !POPULAR_NATIONALITIES.includes(code)
    )
      .sort()
      .map((code) => ({ value: code, label: code })),
  ];

export const DEFAULT_FORM_VALUES: Partial<CreatePlayerDto> = {
  name: "",
  // position: PlayerPosition.FORWARD,
  // dateOfBirth: new Date("2000-01-01"),
  // nationality: "ENG",
  nationality: undefined,
  height: undefined,
  weight: undefined,
  jerseyNumber: undefined,
  marketValue: undefined,
  imageUrl: undefined,
  isActive: false,
};

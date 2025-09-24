/**
 * Football confederation constants
 * Uses ISO 3166-1 alpha-3 country codes organized by FIFA confederations
 */

// UEFA (Europe) - Union of European Football Associations
export const UEFA_CODES = [
  "ALB", // Albania
  "AND", // Andorra
  "ARM", // Armenia
  "AUT", // Austria
  "AZE", // Azerbaijan
  "BLR", // Belarus
  "BEL", // Belgium
  "BIH", // Bosnia and Herzegovina
  "BGR", // Bulgaria
  "HRV", // Croatia
  "CYP", // Cyprus
  "CZE", // Czech Republic
  "DNK", // Denmark
  "EST", // Estonia
  "FIN", // Finland
  "FRA", // France
  "GEO", // Georgia
  "DEU", // Germany
  "GRC", // Greece
  "HUN", // Hungary
  "ISL", // Iceland
  "IRL", // Ireland
  "ITA", // Italy
  "KAZ", // Kazakhstan
  "XKX", // Kosovo
  "LVA", // Latvia
  "LIE", // Liechtenstein
  "LTU", // Lithuania
  "LUX", // Luxembourg
  "MLT", // Malta
  "MDA", // Moldova
  "MCO", // Monaco
  "MNE", // Montenegro
  "NLD", // Netherlands
  "MKD", // North Macedonia
  "NOR", // Norway
  "POL", // Poland
  "PRT", // Portugal
  "ROU", // Romania
  "RUS", // Russia
  "SMR", // San Marino
  "SRB", // Serbia
  "SVK", // Slovakia
  "SVN", // Slovenia
  "ESP", // Spain
  "SWE", // Sweden
  "CHE", // Switzerland
  "TUR", // Turkey
  "UKR", // Ukraine
  "GBR", // United Kingdom
  "VAT", // Vatican City
] as const;

// CONMEBOL (South America) - South American Football Confederation
export const CONMEBOL_CODES = [
  "ARG", // Argentina
  "BOL", // Bolivia
  "BRA", // Brazil
  "CHL", // Chile
  "COL", // Colombia
  "ECU", // Ecuador
  "GUF", // French Guiana
  "GUY", // Guyana
  "PRY", // Paraguay
  "PER", // Peru
  "SUR", // Suriname
  "URY", // Uruguay
  "VEN", // Venezuela
] as const;

// CONCACAF (North/Central America & Caribbean) - Confederation of North, Central America and Caribbean Association Football
export const CONCACAF_CODES = [
  "ATG", // Antigua and Barbuda
  "BHS", // Bahamas
  "BRB", // Barbados
  "BLZ", // Belize
  "CAN", // Canada
  "CRI", // Costa Rica
  "CUB", // Cuba
  "DMA", // Dominica
  "DOM", // Dominican Republic
  "SLV", // El Salvador
  "GRD", // Grenada
  "GTM", // Guatemala
  "HTI", // Haiti
  "HND", // Honduras
  "JAM", // Jamaica
  "MEX", // Mexico
  "NIC", // Nicaragua
  "PAN", // Panama
  "KNA", // Saint Kitts and Nevis
  "LCA", // Saint Lucia
  "VCT", // Saint Vincent and the Grenadines
  "TTO", // Trinidad and Tobago
  "USA", // United States
] as const;

// CAF (Africa) - Confederation of African Football
export const CAF_CODES = [
  "DZA", // Algeria
  "AGO", // Angola
  "BEN", // Benin
  "BWA", // Botswana
  "BFA", // Burkina Faso
  "BDI", // Burundi
  "CMR", // Cameroon
  "CPV", // Cape Verde
  "CAF", // Central African Republic
  "TCD", // Chad
  "COM", // Comoros
  "COG", // Congo
  "COD", // DR Congo
  "CIV", // Côte d'Ivoire
  "DJI", // Djibouti
  "EGY", // Egypt
  "GNQ", // Equatorial Guinea
  "ERI", // Eritrea
  "SWZ", // Eswatini
  "ETH", // Ethiopia
  "GAB", // Gabon
  "GMB", // Gambia
  "GHA", // Ghana
  "GIN", // Guinea
  "GNB", // Guinea-Bissau
  "KEN", // Kenya
  "LSO", // Lesotho
  "LBR", // Liberia
  "LBY", // Libya
  "MDG", // Madagascar
  "MWI", // Malawi
  "MLI", // Mali
  "MRT", // Mauritania
  "MUS", // Mauritius
  "MAR", // Morocco
  "MOZ", // Mozambique
  "NAM", // Namibia
  "NER", // Niger
  "NGA", // Nigeria
  "RWA", // Rwanda
  "STP", // Sao Tome and Principe
  "SEN", // Senegal
  "SYC", // Seychelles
  "SLE", // Sierra Leone
  "SOM", // Somalia
  "ZAF", // South Africa
  "SSD", // South Sudan
  "SDN", // Sudan
  "TZA", // Tanzania
  "TGO", // Togo
  "TUN", // Tunisia
  "UGA", // Uganda
  "ZMB", // Zambia
  "ZWE", // Zimbabwe
] as const;

// AFC (Asia) - Asian Football Confederation
export const AFC_CODES = [
  "AFG", // Afghanistan
  "BHR", // Bahrain
  "BGD", // Bangladesh
  "BTN", // Bhutan
  "BRN", // Brunei
  "KHM", // Cambodia
  "CHN", // China
  "PRK", // North Korea
  "KOR", // South Korea
  "HKG", // Hong Kong
  "IND", // India
  "IDN", // Indonesia
  "IRN", // Iran
  "IRQ", // Iraq
  "JPN", // Japan
  "JOR", // Jordan
  "KWT", // Kuwait
  "KGZ", // Kyrgyzstan
  "LAO", // Laos
  "LBN", // Lebanon
  "MAC", // Macau
  "MYS", // Malaysia
  "MDV", // Maldives
  "MNG", // Mongolia
  "MMR", // Myanmar
  "NPL", // Nepal
  "OMN", // Oman
  "PAK", // Pakistan
  "PSE", // Palestine
  "PHL", // Philippines
  "QAT", // Qatar
  "SAU", // Saudi Arabia
  "SGP", // Singapore
  "LKA", // Sri Lanka
  "SYR", // Syria
  "TWN", // Taiwan
  "TJK", // Tajikistan
  "THA", // Thailand
  "TLS", // Timor-Leste
  "TKM", // Turkmenistan
  "ARE", // UAE
  "UZB", // Uzbekistan
  "VNM", // Vietnam
  "YEM", // Yemen
] as const;

// OFC (Oceania) - Oceania Football Confederation
export const OFC_CODES = [
  "AUS", // Australia
  "COK", // Cook Islands
  "FJI", // Fiji
  "NCL", // New Caledonia
  "NZL", // New Zealand
  "PNG", // Papua New Guinea
  "WSM", // Samoa
  "SLB", // Solomon Islands
  "TON", // Tonga
  "VUT", // Vanuatu
] as const;

// Combine all confederation codes to create the complete list of valid nationalities
export const VALID_NATIONALITIES = [
  ...UEFA_CODES,
  ...CONMEBOL_CODES,
  ...CONCACAF_CODES,
  ...CAF_CODES,
  ...AFC_CODES,
  ...OFC_CODES,
] as const;

// Type definitions
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

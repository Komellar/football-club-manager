/**
 * Get the current season based on the current date
 * Season runs from August to July (e.g., "2024-2025")
 * @param date - Optional date to calculate season for (defaults to now)
 * @returns Season string in format "YYYY-YYYY"
 */
export function getCurrentSeason(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();

  if (month >= 7) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

/**
 * Validate season format (YYYY-YYYY)
 * @param season - Season string to validate
 * @returns true if valid, false otherwise
 */
export function isValidSeasonFormat(season: string): boolean {
  const seasonRegex = /^\d{4}-\d{4}$/;
  if (!seasonRegex.test(season)) {
    return false;
  }

  const [startYear, endYear] = season.split('-').map(Number);
  return endYear === startYear + 1;
}

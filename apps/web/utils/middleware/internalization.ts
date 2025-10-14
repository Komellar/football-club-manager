export function extractLocaleFromPath(pathname: string): {
  locale: string;
  pathWithoutLocale: string;
} {
  const pathSegments = pathname.split("/").filter(Boolean);
  const locale = pathSegments[0] || "en";
  const pathWithoutLocale =
    pathSegments.length > 1 ? "/" + pathSegments.slice(1).join("/") : "/";

  return { locale, pathWithoutLocale };
}

export function buildLocalizedPath(path: string, locale: string): string {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `/${locale}${cleanPath ? `/${cleanPath}` : ""}`;
}

export function isValidLocale(
  locale: string,
  validLocales: readonly string[]
): boolean {
  return validLocales.includes(locale);
}

export const PUBLIC_ROUTES = ["/", "/login", "/register"] as const;

export function shouldSkipMiddleware(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  );
}

export function isPublicRoute(pathWithoutLocale: string): boolean {
  return (PUBLIC_ROUTES as readonly string[]).includes(pathWithoutLocale);
}

export function createLoginRedirect(
  locale: string,
  baseUrl: string,
  originalPath: string
): URL {
  const loginUrl = new URL(`/${locale}/login`, baseUrl);
  loginUrl.searchParams.set("redirect", originalPath);
  return loginUrl;
}

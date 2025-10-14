import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./lib/constants";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import {
  shouldSkipMiddleware,
  isPublicRoute,
  createLoginRedirect,
  extractLocaleFromPath,
  isValidToken,
} from "./utils/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  const intlResponse = intlMiddleware(request);

  const { locale, pathWithoutLocale } = extractLocaleFromPath(pathname);

  if (isPublicRoute(pathWithoutLocale)) {
    return intlResponse;
  }

  // For protected routes, check authentication
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token || !isValidToken(token)) {
    const loginUrl = createLoginRedirect(locale, request.url, pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\..*$).*)",
  ],
};

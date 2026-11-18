import type { Request } from 'express';

export const AUTH_COOKIE_NAME = 'auth_token';

/**
 * The browser sends the httpOnly cookie; the Next.js server forwards that
 * same cookie value as a Bearer header during SSR.
 */
export function extractSessionToken(request: Request): string | undefined {
  const authHeader = request.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const cookies = request.cookies as Record<string, string> | undefined;
  return cookies?.[AUTH_COOKIE_NAME];
}

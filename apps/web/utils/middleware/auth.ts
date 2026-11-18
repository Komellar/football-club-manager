import { jwtDecode } from "jwt-decode";

/**
 * Shape of the session token. The middleware only reads exp to decide
 * whether to redirect to login; the API verifies the signature and checks
 * revocation on every request.
 */
export interface JwtPayload {
  userId: number;
  tv: number;
  iat: number;
  exp: number;
}

export function isValidToken(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
}

export function getUserIdFromToken(token: string): number | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.userId;
  } catch {
    return null;
  }
}

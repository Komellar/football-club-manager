import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
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
    return decoded.sub;
  } catch {
    return null;
  }
}

import type { IncomingMessage } from 'http';

/**
 * Origins allowed to call the API with credentials. FRONTEND_URL may hold a
 * comma-separated list. Read on each call, so values loaded from .env by
 * ConfigModule after this file was imported are still seen.
 */
export function allowedOrigins(): string[] {
  return (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

/**
 * Socket.IO handshake filter. The gateway uses only the websocket
 * transport, which skips CORS, so without this any site the user visits
 * could open a socket that carries the user's cookie (cross-site WebSocket
 * hijacking). Requests without an Origin header come from non-browser
 * clients, which cannot ride on a browser cookie; they still have to
 * authenticate.
 */
export function allowWebSocketRequest(
  req: IncomingMessage,
  callback: (err: string | null | undefined, success: boolean) => void,
): void {
  const origin = req.headers.origin;
  const allowed = origin === undefined || allowedOrigins().includes(origin);
  callback(allowed ? null : 'Origin not allowed', allowed);
}

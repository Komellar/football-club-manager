import type { ThrottlerModuleOptions } from '@nestjs/throttler';

const MINUTE = 60_000;

/** Per-account key: the submitted email, so spreading guesses over many IPs does not help. */
function accountTracker(req: Record<string, any>): string {
  const body = req.body as { email?: unknown } | undefined;
  const email =
    typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  return email || String(req.ip);
}

/**
 * Throttling is applied only to the credential endpoints (see AuthController).
 * Most other traffic arrives from the Next.js server during SSR, so a
 * per-IP limit there would throttle every user at once.
 */
export const throttlerOptions: ThrottlerModuleOptions = {
  throttlers: [
    { name: 'ip', ttl: MINUTE, limit: 10 },
    {
      name: 'account',
      ttl: 15 * MINUTE,
      limit: 10,
      getTracker: accountTracker,
    },
  ],
  errorMessage: 'Too many attempts. Please wait a few minutes and try again.',
};

export const REGISTER_THROTTLE = {
  ip: { ttl: 60 * MINUTE, limit: 5 },
};

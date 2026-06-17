import 'server-only';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyAdminSessionToken } from './admin-session';

/**
 * Defense-in-depth authorization for admin Server Actions.
 *
 * Middleware already gates the /admin routes, but Server Actions are invocable
 * independently, so every mutating admin action must re-verify the signed
 * session token itself before touching the database. Throws 'Unauthorized'
 * (kept generic) when the session is missing or invalid.
 */
export async function assertAdmin(): Promise<void> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) {
    throw new Error('Unauthorized');
  }
}

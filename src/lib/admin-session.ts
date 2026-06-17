import { SignJWT, jwtVerify } from 'jose';

/**
 * Signed, expiring admin session tokens (HS256 via `jose`).
 *
 * Replaces the previous model where the cookie value was the raw
 * ADMIN_SESSION_SECRET — a static, unsigned, non-revocable bearer token. Now the
 * cookie holds a signed JWT with an expiry; tampering fails verification and the
 * token lapses on its own. Edge-safe (jose uses Web Crypto) so the same helper
 * runs in middleware, server actions, and server components.
 */

const ALG = 'HS256';
export const ADMIN_COOKIE = 'admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours, in seconds

function signingKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_MAX_AGE}s`)
    .sign(signingKey());
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, signingKey(), { algorithms: [ALG] });
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

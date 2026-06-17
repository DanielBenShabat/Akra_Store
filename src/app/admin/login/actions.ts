'use server';

import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
} from '@/lib/admin-session';

/** Constant-time password comparison (hash first so unequal lengths don't leak). */
function passwordMatches(input: string, expected: string): boolean {
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function loginAction(formData: FormData): Promise<never> {
  const password = formData.get('password') as string;
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || !password || !passwordMatches(password, expected)) {
    redirect('/admin/login?error=1');
  }

  const token = await createAdminSessionToken();
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: '/',
  });

  redirect('/admin');
}

export async function logoutAction(): Promise<never> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect('/admin/login');
}

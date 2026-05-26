'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData): Promise<never> {
  const password = formData.get('password') as string;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login?error=1');
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');

  (await cookies()).set('admin_session', secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8,
    path: '/',
  });

  redirect('/admin');
}

export async function logoutAction(): Promise<never> {
  (await cookies()).delete('admin_session');
  redirect('/admin/login');
}

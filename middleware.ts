import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifyAdminSessionToken } from '@/lib/admin-session';

export const config = {
  matcher: ['/admin/:path*'],
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const isValid = await verifyAdminSessionToken(token);
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  if (!isValid && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isValid && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

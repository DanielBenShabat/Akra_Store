import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/admin/:path*'],
};

export function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_session');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

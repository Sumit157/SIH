
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // If there's a session cookie, and the user is on an auth page, redirect to home.
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If there's no session cookie, and the user is not on an auth page or the home page, redirect to login.
  if (!session && !isAuthPage && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// This config ensures the middleware runs on all paths except for static assets and API routes.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

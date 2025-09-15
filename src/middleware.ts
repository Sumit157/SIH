
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // If user is trying to access auth pages but is already logged in, redirect to home
  if ((pathname.startsWith('/login') || pathname.startsWith('/register')) && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow access to auth pages if not logged in
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return NextResponse.next();
  }

  // If user is trying to access any other page and is not logged in, redirect to login
  if (!session && pathname !== '/login') {
     // For the root path, allow it to render its "please log in" message
    if (pathname === '/') {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

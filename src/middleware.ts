
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is currently not performing any checks and just passes the request through.
// You can add logic here to protect routes or perform other checks.
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

// This config ensures the middleware runs on all paths except for static assets and API routes.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

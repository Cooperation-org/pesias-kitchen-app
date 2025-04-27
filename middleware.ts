// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the token from cookies or headers
  const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.split(' ')[1];
  
  // Check if user is trying to access dashboard without being logged in
  if (request.nextUrl.pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If user is already logged in and tries to access login page, redirect to dashboard
  if (request.nextUrl.pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths this middleware applies to
export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
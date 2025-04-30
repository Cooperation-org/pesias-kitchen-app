// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Get wallet connection status from cookies
  const isWalletConnected = request.cookies.get('walletConnected')?.value === 'true';
  
  // Check if user is trying to access dashboard without being logged in or wallet disconnected
  if (request.nextUrl.pathname.startsWith('/dashboard') && (!token || !isWalletConnected)) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If user is already logged in and tries to access login page, redirect to dashboard
  if (request.nextUrl.pathname === '/' && token && isWalletConnected) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths this middleware applies to
export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
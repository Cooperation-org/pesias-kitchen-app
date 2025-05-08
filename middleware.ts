// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
 
  // Get wallet connection status from cookies
  const isWalletConnected = request.cookies.get('walletConnected')?.value === 'true';
  
  // Get user role from cookies - we need to add this to the auth service
  const userRole = request.cookies.get('userRole')?.value;
  
  // Check if user is trying to access protected routes without being logged in
  if ((request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin')) 
      && (!token || !isWalletConnected)) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If user is already logged in and tries to access login page, redirect based on role
  if (request.nextUrl.pathname === '/' && token && isWalletConnected) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // If regular user tries to access admin pages, redirect to dashboard
  if (request.nextUrl.pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If admin tries to access regular dashboard, redirect to admin dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard') && userRole === 'admin') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths this middleware applies to
export const config = {
  matcher: ['/', '/dashboard/:path*', '/admin/:path*'],
};
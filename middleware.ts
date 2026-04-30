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

  const pathname = request.nextUrl.pathname;

  const isDashboard = pathname.startsWith('/dashboard');
  const isAdmin = pathname.startsWith('/admin');

  // Public learning route: /dashboard/events/[eventId]/learning (and nested, like quiz)
  const isPublicLearningRoute =
    pathname.startsWith('/dashboard/events/') &&
    pathname.includes('/learning');


  // Protect dashboard/admin, but allow public learning
  if ((isDashboard || isAdmin) && !token && !isPublicLearningRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Root redirect if already logged in
  if (pathname === '/' && token && isWalletConnected) {
    if (userRole === 'admin' || userRole === 'superadmin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Admin protection
  if (isAdmin && userRole !== 'admin' && userRole !== 'superadmin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Admins redirected away from regular dashboard
  if (isDashboard && (userRole === 'admin' || userRole === 'superadmin')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  
  // // Check if user is trying to access protected routes without being logged in
  // // Rely solely on token to avoid flaky redirects due to walletConnected cookie timing
  // if ((request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin')) 
  //     && !token) {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }
  
  // // If user is already logged in and tries to access login page, redirect based on role
  // if (request.nextUrl.pathname === '/' && token && isWalletConnected) {
  //   if (userRole === 'admin' || userRole === 'superadmin') {
  //     return NextResponse.redirect(new URL('/admin', request.url));
  //   } else {
  //     return NextResponse.redirect(new URL('/dashboard', request.url));
  //   }
  // }
  
  // // If regular user tries to access admin pages, redirect to dashboard
  // // Allow both admin and superadmin roles to access admin paths
  // if (request.nextUrl.pathname.startsWith('/admin') && userRole !== 'admin' && userRole !== 'superadmin') {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }
  
  // // If admin or superadmin tries to access regular dashboard, redirect to admin dashboard
  // if (request.nextUrl.pathname.startsWith('/dashboard') && (userRole === 'admin' || userRole === 'superadmin')) {
  //   return NextResponse.redirect(new URL('/admin', request.url));
  // }
  
  return NextResponse.next();
}

// Configure which paths this middleware applies to
export const config = {
  matcher: ['/', '/dashboard/:path*', '/admin/:path*'],
};
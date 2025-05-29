import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher, type ClerkMiddlewareAuth } from '@clerk/nextjs/server';
import type { Database } from '@/database.types';

// Define public routes that don't require authentication initially
// All other routes will be protected by default if not matched here or in isIgnoredRoute
const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-in(.*)',
  '/sign-up(.*)',
  // '/onboarding/select-role', // No longer unconditionally public if we redirect away when onboarded
  '/api/clerk-webhook' 
]);

// Define routes that should be ignored by the middleware (e.g., static assets)
const isIgnoredRoute = createRouteMatcher(['/_next(.*)', '/favicon.ico', '/static(.*)']);

const isOnboardingRoute = createRouteMatcher([
  '/onboarding/select-role',
  '/onboarding/professor-profile'
]);

// Define protected routes that require authentication
const isProtectedRoute = (pathname: string) => {
  return [
    '/student/dashboard',
    '/articles',
    '/projects',
    '/careers'
  ].some(route => pathname.startsWith(route));
};

export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, request: NextRequest) => {
  if (isIgnoredRoute(request)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const authResult = await auth(); 
  const { userId, getToken } = authResult;

  // Handle public routes first
  if (isPublicRoute(request) && !isOnboardingRoute(request)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users on protected routes
  if (isProtectedRoute(pathname) && !userId) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If user is not authenticated
  if (!userId) {
    if (isOnboardingRoute(request) || isPublicRoute(request)) {
      // Allow access to onboarding/public routes if not signed in (e.g. sign-up can lead to onboarding)
      // Or if they are trying to access /onboarding/select-role directly to start the process.
      // Note: /onboarding/select-role will itself redirect if user becomes authenticated mid-flow by this middleware.
      return NextResponse.next();
    }
    // For any other route, redirect to sign-in
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // --- User is Authenticated (userId exists) ---
  const clerkToken = await getToken();
  if (!clerkToken) {
    console.error('Middleware: Clerk token not found for authenticated user.');
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl); // Should not happen often
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
      global: {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
        },
      },
    }
  );

  let userProfile;
  let profileError;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();
    userProfile = data;
    profileError = error;
  } catch (e) {
    console.error('Middleware: Exception querying Supabase for user profile:', e);
    return NextResponse.next(); // Allow access on exception to prevent blocking user
  }

  if (profileError && profileError.code !== 'PGRST116') { // PGRST116: Row not found
    console.error('Middleware: Supabase error fetching user profile:', profileError);
    return NextResponse.next(); // Allow access on error
  }

  const userHasRole = userProfile && userProfile.role;

  if (isOnboardingRoute(request)) {
    if (userHasRole) {
      // User is authenticated, has a role, but trying to access an onboarding page.
      // Redirect them to their dashboard.
      // userProfile is guaranteed to be non-null here because userHasRole is true.
      const dashboardUrl = userProfile!.role === 'student' ? '/student/dashboard' : '/professor/dashboard';
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
    // User is on an onboarding route and does NOT have a role yet (or no profile), so allow access.
    return NextResponse.next();
  }

  // At this point, user is authenticated AND on a PROTECTED route (not public, not ignored, not onboarding)
  if (!userHasRole) {
    // User is authenticated but has no role (and not on an onboarding page), redirect to role selection.
    const selectRoleUrl = new URL('/onboarding/select-role', request.url);
    return NextResponse.redirect(selectRoleUrl);
  }
  
  // TODO: Add further checks if student/professor profile details are incomplete
  // and redirect to /onboarding/student-profile or /onboarding/professor-profile if necessary.

  // All checks passed, user is authenticated, has a role, and is on a protected page they should access.
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
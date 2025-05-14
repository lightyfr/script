import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher, type ClerkMiddlewareAuth } from '@clerk/nextjs/server';
import type { Database } from '@/database.types';

// Define public routes that don't require authentication initially
// All other routes will be protected by default if not matched here or in isIgnoredRoute
const isPublicRoute = createRouteMatcher([
  '/', // Assuming landing page is public
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding/select-role', // Allow access to role selection page itself
  '/api/clerk-webhook' // Example public API route
]);

// Define routes that should be ignored by the middleware (e.g., static assets)
const isIgnoredRoute = createRouteMatcher(['/_next(.*)', '/favicon.ico', '/static(.*)']);

export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, request: NextRequest) => {
  // If the route is ignored, let it pass
  if (isIgnoredRoute(request)) {
    return NextResponse.next();
  }

  // If the route is public, let it pass
  // Exception: if user is on a public route BUT already authenticated AND has no role, 
  // they should still be guided to onboarding if trying to access something other than onboarding.
  if (isPublicRoute(request)) {
    // If user is authenticated and on a public route that is NOT the onboarding page itself,
    // and they don't have a role yet, they might still need to be redirected later
    // if they try to navigate away from onboarding without completing it.
    // This specific check for public routes is complex if we want to force onboarding
    // even from public pages for an authenticated but unprofiled user.
    // For now, let's keep it simple: public routes are accessible.
    // The main onboarding check will happen for protected routes.
    return NextResponse.next();
  }

  // At this point, the route is not ignored and not public, so it's considered protected.
  // Await auth() to get the auth object, then destructure userId and getToken.
  const authResult = await auth(); 
  const { userId, getToken } = authResult;

  if (!userId) {
    // No userId, so user is not authenticated. Redirect to sign-in.
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }

  // User is authenticated (userId exists).
  // If they are trying to access the onboarding page, let them.
  if (request.nextUrl.pathname.startsWith('/onboarding/select-role')) {
    return NextResponse.next();
  }

  // User is authenticated and NOT on the onboarding page.
  // Check if they have completed role selection.
  const clerkToken = await getToken();
  if (!clerkToken) {
    console.error('Middleware: Clerk token not found for authenticated user with userId.');
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        // In middleware, setting/removing cookies for the Supabase client is less critical
        // if we are primarily relying on the Authorization header with the Clerk token.
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

  try {
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: Row not found
      console.error('Middleware: Supabase error fetching user profile:', error);
      // Allow access but log error, or redirect to an error page. For now, let it pass.
      return NextResponse.next(); 
    }

    // If user profile doesn't exist in our public.users table OR their role is not set,
    // redirect to role selection page.
    if (!userProfile || !userProfile.role) {
      const onboardingUrl = new URL('/onboarding/select-role', request.url);
      return NextResponse.redirect(onboardingUrl);
    }
    
    // Optional: Role-specific dashboard redirection
    // if (userProfile.role === 'student' && !request.nextUrl.pathname.startsWith('/student')) {
    //   return NextResponse.redirect(new URL('/student/dashboard', request.url));
    // } else if (userProfile.role === 'professor' && !request.nextUrl.pathname.startsWith('/professor')) {
    //   return NextResponse.redirect(new URL('/professor/dashboard', request.url));
    // }

  } catch (e) {
    console.error('Middleware: Exception during Supabase user profile check:', e);
    // Fallback: allow access or redirect to a generic error page. For now, let it pass.
    return NextResponse.next();
  }
  
  // If all checks pass (user authenticated, role selected), allow access.
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
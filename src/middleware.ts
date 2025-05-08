import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define which routes should be public (accessible without authentication)
const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/sign-up(.*)'
]);

// Use clerkMiddleware with route protection
export default clerkMiddleware(async (auth, req) => {
  // If the route is not public, protect it
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
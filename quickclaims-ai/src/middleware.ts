import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that require authentication and organization
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/contractor(.*)",
  "/claims(.*)",
  "/contractors(.*)",
  "/estimators(.*)",
  "/carriers(.*)",
  "/reports(.*)",
  "/settings(.*)",
  "/portal(.*)",
]);

// Routes for organization selection (auth required, org not required)
const isOrgSelectionRoute = createRouteMatcher([
  "/org-selection(.*)",
]);

// Public routes (no auth required)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth();

  // Protected routes require both auth and organization
  if (isProtectedRoute(req)) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      return Response.redirect(signInUrl);
    }

    // If user has no active organization, redirect to org selection
    if (!orgId) {
      const orgSelectionUrl = new URL("/org-selection", req.url);
      return Response.redirect(orgSelectionUrl);
    }
  }

  // Org selection route requires auth but not organization
  if (isOrgSelectionRoute(req)) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      return Response.redirect(signInUrl);
    }
    // If user already has an org, redirect to dashboard
    if (orgId) {
      const dashboardUrl = new URL("/dashboard", req.url);
      return Response.redirect(dashboardUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

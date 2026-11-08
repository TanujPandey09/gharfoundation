import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected/private routes
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/post-property(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow clerk_bypass ONLY in non-production local development/testing
  const isDev = process.env.NODE_ENV !== "production";
  const isBypass = isDev && req.cookies.get("clerk_bypass")?.value === "true";
  
  if (isProtectedRoute(req) && !isBypass) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Required for Clerk proxy on vercel.app
    "/__clerk(.*)",
  ],
};

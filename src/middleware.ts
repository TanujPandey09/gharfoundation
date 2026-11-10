import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySignedSession } from "@/lib/server-auth";

// Define protected/private routes
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/post-property(.*)",
  "/documents(.*)",
  "/favorites(.*)",
  "/leads(.*)",
  "/messages(.*)",
  "/payments(.*)",
  "/properties(.*)",
  "/schedule(.*)",
  "/settings(.*)",
  "/analytics(.*)",
  "/onboarding(.*)"
]);

const clerkHandler = clerkMiddleware(async (auth, req: NextRequest) => {
  // Check for verified cryptographic mobile session token
  const sessionCookie =
    req.cookies.get("ghar_session")?.value ||
    req.cookies.get("ghar_phone_uid")?.value;

  const validUserId = sessionCookie ? await verifySignedSession(sessionCookie) : null;
  const isDev = process.env.NODE_ENV !== "production";
  const isDevBypass = isDev && req.cookies.get("clerk_bypass")?.value === "true";

  if (isProtectedRoute(req) && !validUserId && !isDevBypass) {
    await auth.protect();
  }
});

export default async function middleware(req: NextRequest, event: any) {
  const pathname = req.nextUrl.pathname;

  // Handle Clerk proxy requests on /__clerk/:path*
  if (pathname.startsWith("/__clerk")) {
    const targetPath = pathname.replace(/^\/__clerk/, "") || "/";
    const targetUrl = new URL(`${targetPath}${req.nextUrl.search}`, "https://frontend-api.clerk.dev");

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("Clerk-Proxy-Url", `${req.nextUrl.origin}/__clerk`);
    if (process.env.CLERK_SECRET_KEY) {
      requestHeaders.set("Clerk-Secret-Key", process.env.CLERK_SECRET_KEY);
    }
    const clientIp = req.headers.get("x-forwarded-for") || "";
    if (clientIp) {
      requestHeaders.set("X-Forwarded-For", clientIp);
    }
    requestHeaders.set("X-Forwarded-Host", req.nextUrl.host);
    requestHeaders.set("X-Forwarded-Proto", req.nextUrl.protocol.replace(":", ""));

    return NextResponse.rewrite(targetUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Required for Clerk proxy on vercel.app
    "/__clerk",
    "/__clerk/:path*",
  ],
};

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected/private routes
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/post-property(.*)"
]);

function getFrontendApiHost(): string | null {
  if (process.env.CLERK_FRONTEND_API) {
    return process.env.CLERK_FRONTEND_API.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
  const rawPk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const pk = rawPk.replace(/^["']|["']$/g, "").trim();
  try {
    const match = pk.match(/^pk_(test|live)_(.+)$/);
    if (!match) return null;
    const decoded = Buffer.from(match[2], "base64").toString("utf-8");
    return decoded.endsWith("$") ? decoded.slice(0, -1) : decoded;
  } catch {
    return null;
  }
}

const clerkHandler = clerkMiddleware(async (auth, req: NextRequest) => {
  // Allow clerk_bypass ONLY in non-production local development/testing
  const isDev = process.env.NODE_ENV !== "production";
  const isBypass = isDev && req.cookies.get("clerk_bypass")?.value === "true";
  
  if (isProtectedRoute(req) && !isBypass) {
    await auth.protect();
  }
});

export default async function middleware(req: NextRequest, event: any) {
  const pathname = req.nextUrl.pathname;

  // Handle Clerk proxy requests on /__clerk/:path*
  if (pathname.startsWith("/__clerk")) {
    const frontendApi = getFrontendApiHost();
    if (frontendApi) {
      const targetPath = pathname.replace(/^\/__clerk/, "") || "/";
      const targetUrl = new URL(`${targetPath}${req.nextUrl.search}`, `https://${frontendApi}`);

      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("Clerk-Proxy-Url", `${req.nextUrl.origin}/__clerk`);
      if (process.env.CLERK_SECRET_KEY) {
        requestHeaders.set("Clerk-Secret-Key", process.env.CLERK_SECRET_KEY);
      }
      requestHeaders.set("X-Forwarded-Host", req.nextUrl.host);
      requestHeaders.set("X-Forwarded-Proto", req.nextUrl.protocol.replace(":", ""));

      return NextResponse.rewrite(targetUrl, {
        request: {
          headers: requestHeaders,
        },
      });
    }
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
    "/__clerk/:path*",
  ],
};

import { NextRequest, NextResponse } from "next/server";

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

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ catchall?: string[] }> }) {
  const resolvedParams = await params;
  const catchall = resolvedParams.catchall ? resolvedParams.catchall.join("/") : "";
  const frontendApi = getFrontendApiHost();
  if (!frontendApi) {
    return new NextResponse("Clerk Frontend API Host not resolved", { status: 500 });
  }

  const url = new URL(`/${catchall}${req.nextUrl.search}`, `https://${frontendApi}`);
  const headers = new Headers(req.headers);
  headers.set("Host", frontendApi);
  headers.set("Clerk-Proxy-Url", `${req.nextUrl.origin}/__clerk`);
  if (process.env.CLERK_SECRET_KEY) {
    headers.set("Clerk-Secret-Key", process.env.CLERK_SECRET_KEY);
  }
  headers.set("X-Forwarded-Host", req.nextUrl.host);
  headers.set("X-Forwarded-Proto", req.nextUrl.protocol.replace(":", ""));

  const body = req.method !== "GET" && req.method !== "HEAD" ? await req.blob() : undefined;

  const res = await fetch(url.toString(), {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });

  const responseHeaders = new Headers(res.headers);
  responseHeaders.delete("content-encoding");

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const HEAD = handleProxy;
export const OPTIONS = handleProxy;

import { NextRequest, NextResponse } from "next/server";

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ catchall?: string[] }> }) {
  const resolvedParams = await params;
  const catchall = resolvedParams.catchall ? resolvedParams.catchall.join("/") : "";

  const url = new URL(`/${catchall}${req.nextUrl.search}`, "https://frontend-api.clerk.dev");
  const headers = new Headers(req.headers);
  headers.set("Host", "frontend-api.clerk.dev");
  headers.set("Clerk-Proxy-Url", `${req.nextUrl.origin}/__clerk`);
  if (process.env.CLERK_SECRET_KEY) {
    headers.set("Clerk-Secret-Key", process.env.CLERK_SECRET_KEY);
  }
  const clientIp = req.headers.get("x-forwarded-for") || "";
  if (clientIp) {
    headers.set("X-Forwarded-For", clientIp);
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

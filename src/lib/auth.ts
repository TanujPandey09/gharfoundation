import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "./prisma";
import { verifySignedSession } from "./server-auth";

/**
 * Get the authenticated Clerk user ID or Mobile OTP session user ID from the request context.
 * Returns the userId string, or null if not authenticated.
 */
export async function getAuthUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    if (userId) return userId;
  } catch {
    // Fallback to signed session check below
  }

  try {
    const cookieStore = await cookies();
    const sessionToken =
      cookieStore.get("ghar_session")?.value ||
      cookieStore.get("ghar_phone_uid")?.value;

    if (sessionToken) {
      const verifiedUserId = await verifySignedSession(sessionToken);
      if (verifiedUserId) return verifiedUserId;
    }
  } catch {
    // Ignore cookie read error outside request context
  }

  return null;
}

/**
 * Require authentication — returns userId or throws a 401 response.
 * Use this in API routes that require a logged-in user.
 */
export async function requireAuth(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId) {
    throw NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }
  return userId;
}

/**
 * Sync-on-read: Ensure the user exists in our Prisma database.
 * If they don't exist yet, create a minimal record.
 * Returns the Prisma User record.
 */
export async function ensureUserInDb(clerkUserId: string) {
  let user = await prisma.user.findUnique({
    where: { id: clerkUserId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: clerkUserId,
        role: "RENTER",
      },
    });
  }

  return user;
}

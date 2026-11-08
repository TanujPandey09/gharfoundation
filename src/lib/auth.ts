import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "./prisma";

/**
 * Get the authenticated Clerk user ID from the request context.
 * Returns the userId string, or null if not authenticated.
 */
export async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
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
 * Sync-on-read: Ensure the Clerk user exists in our Prisma database.
 * If they don't exist yet, create a minimal record.
 * Returns the Prisma User record.
 */
export async function ensureUserInDb(clerkUserId: string) {
  let user = await prisma.user.findUnique({
    where: { id: clerkUserId },
  });

  if (!user) {
    // Create a minimal user record — the frontend onboarding flow
    // will update their name, role, and preferences later.
    user = await prisma.user.create({
      data: {
        id: clerkUserId,
        role: "GUEST",
      },
    });
  }

  return user;
}

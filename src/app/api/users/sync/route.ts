import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/users/sync
 * Called from the frontend after Clerk sign-in to ensure the user exists in our DB.
 * This is an upsert — creates if new, updates if existing.
 * Handles unique constraint conflicts on email/phone gracefully.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, image } = body;

    let user;
    try {
      user = await prisma.user.upsert({
        where: { id: userId },
        update: {
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
          image: image || undefined,
          updatedAt: new Date(),
        },
        create: {
          id: userId,
          name: name || "User",
          email: email || null,
          phone: phone || null,
          image: image || null,
          role: "RENTER",
        },
      });
    } catch (prismaErr: any) {
      // Handle unique constraint violation (P2002) on email or phone
      // This happens when a demo/mock user already has this email/phone
      if (prismaErr?.code === "P2002") {
        const conflictField = prismaErr.meta?.target?.[0]; // "email" or "phone"
        console.warn(`User sync: unique conflict on "${conflictField}" for Clerk user ${userId}. Retrying without conflicting field.`);

        // Clear the conflicting field from old records first
        if (conflictField === "email" && email) {
          await prisma.user.updateMany({
            where: { email, id: { not: userId } },
            data: { email: null },
          });
        } else if (conflictField === "phone" && phone) {
          await prisma.user.updateMany({
            where: { phone, id: { not: userId } },
            data: { phone: null },
          });
        }

        // Retry the upsert
        user = await prisma.user.upsert({
          where: { id: userId },
          update: {
            name: name || undefined,
            email: email || undefined,
            phone: phone || undefined,
            image: image || undefined,
            updatedAt: new Date(),
          },
          create: {
            id: userId,
            name: name || "User",
            email: email || null,
            phone: phone || null,
            image: image || null,
            role: "RENTER",
          },
        });
      } else {
        throw prismaErr;
      }
    }

    return NextResponse.json({
      id: user.id,
      role: user.role,
      onboardingStatus: user.onboardingStatus,
      activeWorkspace: user.activeWorkspace,
      synced: true,
    });
  } catch (error) {
    console.error("User sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}

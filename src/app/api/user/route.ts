import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, ensureUserInDb } from "@/lib/auth";

/**
 * GET /api/user
 * Get the current user's profile with active workspace and onboarding status.
 */
export async function GET() {
  try {
    const userId = await requireAuth();
    
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownerProfile: true,
        tenantProfile: true,
      },
    });

    if (!user) {
      user = await ensureUserInDb(userId) as any;
    }

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("GET /api/user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/user
 * Update the current user's profile (name, phone, activeWorkspace, onboardingStatus).
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireAuth();
    await ensureUserInDb(userId);

    const body = await request.json();

    // Only allow updating safe fields
    const allowedFields = ["name", "phone", "image", "role", "activeWorkspace", "onboardingStatus"];
    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        ownerProfile: true,
        tenantProfile: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("PATCH /api/user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

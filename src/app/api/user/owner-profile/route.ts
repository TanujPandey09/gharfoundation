import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * POST /api/user/owner-profile
 * Creates or updates the OwnerProfile upon guided onboarding completion.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { ownerType, businessName, companyName, licenseNumber } = body;

    const profile = await prisma.ownerProfile.upsert({
      where: { userId },
      create: {
        userId,
        ownerType: ownerType || "PRIVATE_OWNER",
        businessName: businessName || null,
        companyName: companyName || null,
        licenseNumber: licenseNumber || null,
        phoneVerified: true,
        emailVerified: true,
        verificationStatus: "VERIFIED",
        profileCompletion: 100,
      },
      update: {
        ownerType: ownerType || undefined,
        businessName: businessName || undefined,
        companyName: companyName || undefined,
        licenseNumber: licenseNumber || undefined,
        verificationStatus: "VERIFIED",
        profileCompletion: 100,
      },
    });

    // Set user onboarding status and active workspace
    await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingStatus: "COMPLETED",
        activeWorkspace: "HOSTING",
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("POST /api/user/owner-profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

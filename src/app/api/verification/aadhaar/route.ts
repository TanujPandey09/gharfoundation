import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, ensureUserInDb } from "@/lib/auth";

/**
 * POST /api/verification/aadhaar
 * Submit Aadhaar e-KYC verification. Stores masked Aadhaar and marks user as verified.
 * Body: { aadhaarNumber, fullName, method: "OTP" | "UPLOAD", maskedAadhaar }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    await ensureUserInDb(userId);

    const body = await request.json();
    const { aadhaarNumber, fullName, method, maskedAadhaar } = body;

    if (!maskedAadhaar) {
      return NextResponse.json(
        { error: "Masked Aadhaar number is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        documentsVerified: true,
        aadhaarMasked: maskedAadhaar,
        name: fullName || undefined,
        onboardingStatus: "COMPLETED",
      },
      include: {
        ownerProfile: true,
        tenantProfile: true,
      },
    });

    return NextResponse.json({
      success: true,
      status: "UNDER_REVIEW",
      verified: user.aadhaarVerified,
      documentsVerified: true,
      maskedAadhaar: user.aadhaarMasked,
      name: user.name,
      message: "Identity documents submitted for verification review",
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("POST /api/verification/aadhaar error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/verification/aadhaar
 * Check Aadhaar verification status for the current user.
 */
export async function GET() {
  try {
    const userId = await requireAuth();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        aadhaarVerified: true,
        aadhaarMasked: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        documentsVerified: true,
        onboardingStatus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      aadhaarVerified: user.aadhaarVerified,
      maskedAadhaar: user.aadhaarMasked,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      documentsVerified: user.documentsVerified,
      onboardingStatus: user.onboardingStatus,
      profileComplete: !!(user.name && user.email && user.image),
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("GET /api/verification/aadhaar error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

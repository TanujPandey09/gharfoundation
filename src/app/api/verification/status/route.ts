import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/verification/status
 * Aggregated verification status for the current user dashboard.
 */
export async function GET() {
  try {
    const userId = await requireAuth();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        emailVerified: true,
        aadhaarVerified: true,
        aadhaarMasked: true,
        documentsVerified: true,
        onboardingStatus: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const checks = [
      { id: "email", label: "Email", verified: !!user.email && user.emailVerified },
      { id: "profile", label: "Profile Picture", verified: !!user.image },
      { id: "aadhaar", label: "Aadhaar KYC", verified: user.aadhaarVerified },
      { id: "documents", label: "Documents", verified: user.documentsVerified },
    ];

    const allVerified = checks.every((c) => c.verified);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
      },
      checks,
      allVerified,
      onboardingStatus: user.onboardingStatus,
      maskedAadhaar: user.aadhaarMasked,
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("GET /api/verification/status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, ensureUserInDb } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateAadhaarVerhoeff, maskAadhaar } from "@/lib/validations/id-verification";

/**
 * POST /api/verification/aadhaar
 * Submit Aadhaar identity document screening. Stores masked Aadhaar and submits for review.
 * Body: { aadhaarNumber, fullName, method: "UPLOAD", maskedAadhaar, documentType }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();

    // Rate limiting: Max 5 submissions per hour per user
    const rl = await checkRateLimit(`kyc_submit:${userId}`, 5, 3600);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many document submissions. Please wait before submitting again." },
        { status: 429 }
      );
    }

    await ensureUserInDb(userId);

    const body = await request.json();
    const { aadhaarNumber, fullName, method, maskedAadhaar, documentType = "AADHAAR_CARD" } = body;

    // Server-side Verhoeff verification if Aadhaar
    if (documentType === "AADHAAR_CARD" && aadhaarNumber) {
      const clean = String(aadhaarNumber).replace(/\D/g, "");
      if (clean.length === 12) {
        const check = validateAadhaarVerhoeff(clean);
        if (!check.valid) {
          return NextResponse.json(
            { error: check.error || "Invalid Aadhaar number checksum." },
            { status: 400 }
          );
        }
      }
    }

    const secureMasked = maskedAadhaar || (aadhaarNumber ? maskAadhaar(aadhaarNumber) : "XXXX XXXX ••••");

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        documentsVerified: true,
        aadhaarMasked: secureMasked,
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
      documentType,
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

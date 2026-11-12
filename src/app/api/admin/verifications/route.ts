import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { dispatchSystemNotification } from "@/lib/services/notifications";

/**
 * GET /api/admin/verifications
 * Returns pending and reviewed KYC submissions.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get("status"); // optional filter

    const where: any = {
      OR: [
        { kycFrontUrl: { not: null } },
        { aadhaarMasked: { not: null } },
        { kycStatus: { in: ["UNDER_REVIEW", "VERIFIED", "REJECTED"] } },
      ],
    };

    if (filterStatus && ["UNDER_REVIEW", "VERIFIED", "REJECTED", "NOT_STARTED"].includes(filterStatus)) {
      where.kycStatus = filterStatus;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        aadhaarMasked: true,
        aadhaarVerified: true,
        documentsVerified: true,
        kycStatus: true,
        kycDocumentType: true,
        kycFrontUrl: true,
        kycBackUrl: true,
        kycSubmittedAt: true,
        kycReviewedAt: true,
        kycRejectionReason: true,
        createdAt: true,
      },
      orderBy: { kycSubmittedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("GET /api/admin/verifications error:", err);
    return NextResponse.json({ error: "Failed to load verifications queue" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/verifications
 * Approves or Rejects a user's KYC verification submission.
 * Body: { userId: string, action: "APPROVE" | "REJECT", reason?: string }
 */
export async function PATCH(req: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const body = await req.json();
    const { userId, action, reason } = body;

    if (!userId || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "userId and valid action (APPROVE or REJECT) are required" },
        { status: 400 }
      );
    }

    if (action === "APPROVE") {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          aadhaarVerified: true,
          documentsVerified: true,
          kycStatus: "VERIFIED",
          kycReviewedAt: new Date(),
          kycRejectionReason: null,
        },
      });

      await dispatchSystemNotification({
        userId,
        title: "KYC Verification Approved",
        body: "Your identity documents have been verified by the Ghar Foundation review team. Your profile now carries the verified resident badge.",
        type: "APPROVAL",
      });

      return NextResponse.json({
        success: true,
        message: `KYC for ${updated.name || updated.email} approved successfully.`,
        user: updated,
      });
    } else {
      const rejectionReason = reason || "Submitted document image was unclear or incomplete.";
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          aadhaarVerified: false,
          documentsVerified: false,
          kycStatus: "REJECTED",
          kycReviewedAt: new Date(),
          kycRejectionReason: rejectionReason,
        },
      });

      await dispatchSystemNotification({
        userId,
        title: "KYC Verification Action Required",
        body: `Your identity document verification was not approved. Reason: ${rejectionReason}. Please re-upload in Settings.`,
        type: "INFO",
      });

      return NextResponse.json({
        success: true,
        message: `KYC for ${updated.name || updated.email} rejected.`,
        user: updated,
      });
    }
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("PATCH /api/admin/verifications error:", err);
    return NextResponse.json({ error: "Failed to update verification status" }, { status: 500 });
  }
}


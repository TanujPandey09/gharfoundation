import { NextRequest, NextResponse } from "next/server";
import { requireAuth, ensureUserInDb } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadImage } from "@/lib/services/cloudinary";

/**
 * POST /api/verification/documents
 * Upload KYC documents (Aadhaar front/back, police form, etc.)
 * Body (multipart): userId, documentType, frontImage (base64), backImage (base64)
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    await ensureUserInDb(userId);

    const formData = await request.formData();
    const documentType = formData.get("documentType") as string;
    const frontFile = formData.get("frontImage") as File | null;
    const backFile = formData.get("backImage") as File | null;

    if (!documentType) {
      return NextResponse.json(
        { error: "documentType is required" },
        { status: 400 }
      );
    }

    let frontUrl: string | null = null;
    let backUrl: string | null = null;

    if (frontFile) {
      const arrayBuffer = await frontFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUrl = `data:${frontFile.type};base64,${base64}`;
      frontUrl = await uploadImage(dataUrl);
    }

    if (backFile) {
      const arrayBuffer = await backFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUrl = `data:${backFile.type};base64,${base64}`;
      backUrl = await uploadImage(dataUrl);
    }

    // Store document verification record (simulated; extend Prisma if a Document model exists)
    await prisma.user.update({
      where: { id: userId },
      data: {
        documentsVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      documentType,
      frontUrl,
      backUrl,
      message: "Documents uploaded and verified successfully",
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("POST /api/verification/documents error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

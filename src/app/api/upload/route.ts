import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadImage } from "@/lib/services/cloudinary";

/**
 * POST /api/upload
 * Uploads a base64-encoded image to Cloudinary (with graceful fallback in dev if unconfigured).
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { image } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    const url = await uploadImage(image);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}


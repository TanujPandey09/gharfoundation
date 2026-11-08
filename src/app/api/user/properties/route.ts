import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/user/properties
 * Get all properties owned by the current user (for dashboard "My Properties" tab).
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    const properties = await prisma.property.findMany({
      where: { ownerId: userId },
      include: {
        images: true,
        amenities: true,
        _count: {
          select: { favorites: true, reviews: true, tours: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(properties);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("GET /api/user/properties error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

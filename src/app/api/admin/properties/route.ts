import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * GET /api/admin/properties
 * List properties for administrative review.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || 50);

    const properties = await prisma.property.findMany({
      include: {
        owner: { select: { id: true, name: true, phone: true, email: true, aadhaarVerified: true } },
        images: { select: { url: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("GET /api/admin/properties error:", err);
    return NextResponse.json({ error: "Failed to load properties" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/properties
 * Moderates properties: toggle verification, toggle featured, or delete spam.
 * Body: { propertyId: string, isVerified?: boolean, isFeatured?: boolean, delete?: boolean }
 */
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { propertyId, isVerified, isFeatured, delete: shouldDelete } = body;

    if (!propertyId) {
      return NextResponse.json({ error: "propertyId is required" }, { status: 400 });
    }

    if (shouldDelete) {
      await prisma.property.delete({ where: { id: propertyId } });
      return NextResponse.json({ success: true, message: "Property listing removed successfully" });
    }

    const updateData: any = {};
    if (typeof isVerified === "boolean") updateData.isVerified = isVerified;
    if (typeof isFeatured === "boolean") updateData.isFeatured = isFeatured;

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Property listing updated",
      property: updated,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("PATCH /api/admin/properties error:", err);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

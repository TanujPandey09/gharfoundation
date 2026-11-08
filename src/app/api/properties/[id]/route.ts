import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, ensureUserInDb } from "@/lib/auth";
import { UpdatePropertySchema } from "@/lib/validations/property";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/properties/[id]
 * Get a single property by ID with full details.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
        amenities: true,
        owner: {
          select: { id: true, name: true, image: true, role: true, phone: true, email: true },
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { favorites: true, reviews: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Increment view count atomically (fire and forget)
    prisma.property.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    }).catch(() => {}); // Non-blocking

    return NextResponse.json(property);
  } catch (error) {
    console.error("GET /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/properties/[id]
 * Update a property (owner only).
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireAuth();
    const { id } = await params;

    // Verify ownership
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    if (existing.ownerId !== userId) {
      const user = await ensureUserInDb(userId);
      if (user.role !== "ADMIN") {
        return NextResponse.json({ error: "You can only edit your own properties" }, { status: 403 });
      }
    }

    const body = await request.json();
    const validated = UpdatePropertySchema.parse(body);

    const { amenities, imageUrls, availableFrom, ...updateData } = validated;

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...updateData,
        ...(availableFrom && { availableFrom: new Date(availableFrom) }),
      },
      include: {
        images: true,
        amenities: true,
      },
    });

    // If amenities provided, replace them
    if (amenities) {
      await prisma.amenity.deleteMany({ where: { propertyId: id } });
      await prisma.amenity.createMany({
        data: amenities.map((name) => ({ name, propertyId: id })),
      });
    }

    // If images provided, replace them
    if (imageUrls) {
      await prisma.image.deleteMany({ where: { propertyId: id } });
      await prisma.image.createMany({
        data: imageUrls.map((url) => ({ url, propertyId: id })),
      });
    }

    return NextResponse.json(property);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    console.error("PATCH /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/properties/[id]
 * Delete a property (owner or admin only).
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireAuth();
    const { id } = await params;

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (existing.ownerId !== userId) {
      const user = await ensureUserInDb(userId);
      if (user.role !== "ADMIN") {
        return NextResponse.json({ error: "You can only delete your own properties" }, { status: 403 });
      }
    }

    // Cascade delete handles images, amenities, favorites, reviews, reports
    await prisma.property.delete({ where: { id } });

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("DELETE /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

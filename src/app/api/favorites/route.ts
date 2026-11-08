import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/favorites
 * Get all favorited properties for the current user.
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            images: true,
            amenities: true,
            owner: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("GET /api/favorites error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/favorites
 * Add a property to favorites.
 * Body: { propertyId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();

    if (!body.propertyId) {
      return NextResponse.json({ error: "propertyId is required" }, { status: 400 });
    }

    // Check property exists
    const property = await prisma.property.findUnique({ where: { id: body.propertyId } });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Check for duplicate
    const existing = await prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId: body.propertyId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already in favorites" }, { status: 409 });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        propertyId: body.propertyId,
      },
      include: {
        property: {
          include: { images: true, amenities: true },
        },
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("POST /api/favorites error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

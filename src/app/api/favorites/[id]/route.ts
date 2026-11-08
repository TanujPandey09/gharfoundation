import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/favorites/[id]
 * Remove a property from favorites.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireAuth();
    const { id } = await params;

    let favorite = await prisma.favorite.findUnique({ where: { id } });
    if (!favorite) {
      // Fallback: try finding by userId and propertyId (where id represents propertyId)
      favorite = await prisma.favorite.findUnique({
        where: { userId_propertyId: { userId, propertyId: id } },
      });
    }

    if (!favorite) {
      return NextResponse.json({ error: "Favorite not found" }, { status: 404 });
    }

    if (favorite.userId !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.favorite.delete({ where: { id } });

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("DELETE /api/favorites/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

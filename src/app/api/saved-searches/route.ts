import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/saved-searches
 * Get all saved searches for the current user.
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    const searches = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(searches);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("GET /api/saved-searches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/saved-searches
 * Save a search query and filters.
 * Body: { query?: string, filters: object }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();

    if (!body.filters || typeof body.filters !== "object") {
      return NextResponse.json({ error: "filters object is required" }, { status: 400 });
    }

    const saved = await prisma.savedSearch.create({
      data: {
        userId,
        query: body.query || null,
        filters: body.filters,
      },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("POST /api/saved-searches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/saved-searches
 * Delete a saved search by ID.
 * Body: { id: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const search = await prisma.savedSearch.findUnique({ where: { id: body.id } });
    if (!search || search.userId !== userId) {
      return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
    }

    await prisma.savedSearch.delete({ where: { id: body.id } });

    return NextResponse.json({ message: "Saved search deleted" });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("DELETE /api/saved-searches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

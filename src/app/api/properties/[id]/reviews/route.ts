import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { CreateReviewSchema } from "@/lib/validations/review";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/properties/[id]/reviews
 * Get all reviews for a property.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const reviews = await prisma.review.findMany({
      where: { propertyId: id },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/properties/[id]/reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/properties/[id]/reviews
 * Submit a review for a property (authenticated users only).
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireAuth();
    const { id } = await params;

    // Check property exists
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Prevent owners from reviewing their own property
    if (property.ownerId === userId) {
      return NextResponse.json({ error: "You cannot review your own property" }, { status: 400 });
    }

    // Check for duplicate review
    const existingReview = await prisma.review.findFirst({
      where: { propertyId: id, userId },
    });
    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this property" }, { status: 409 });
    }

    const body = await request.json();
    const validated = CreateReviewSchema.parse(body);

    const review = await prisma.review.create({
      data: {
        ...validated,
        propertyId: id,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    console.error("POST /api/properties/[id]/reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { CreateTourSchema } from "@/lib/validations/tour";
import { dispatchSystemNotification } from "@/lib/services/notifications";

/**
 * GET /api/tours
 * Get all tours for the current user — both as renter and as property owner.
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    const tours = await prisma.tour.findMany({
      where: {
        OR: [
          { userId },                             // Tours I scheduled
          { property: { ownerId: userId } },       // Tours for my properties
        ],
      },
      include: {
        property: {
          include: {
            images: { take: 1 },  // Just the first image for thumbnail
            owner: { select: { id: true, name: true, image: true, phone: true } },
          },
        },
        user: { select: { id: true, name: true, image: true, phone: true } },
      },
      orderBy: { scheduledDate: "asc" },
    });

    return NextResponse.json(tours);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("GET /api/tours error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/tours
 * Schedule a new property tour.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const validated = CreateTourSchema.parse(body);

    // Check property exists
    const property = await prisma.property.findUnique({ where: { id: validated.propertyId } });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Prevent owners from scheduling tours on their own property
    if (property.ownerId === userId) {
      return NextResponse.json({ error: "You cannot schedule a tour for your own property" }, { status: 400 });
    }

    const tour = await prisma.tour.create({
      data: {
        propertyId: validated.propertyId,
        userId,
        date: new Date(validated.date),
        time: validated.time,
        scheduledDate: validated.scheduledDate ? new Date(validated.scheduledDate) : new Date(validated.date),
        status: "PENDING",
      },
      include: {
        property: {
          include: {
            images: { take: 1 },
            owner: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });

    await dispatchSystemNotification({
      userId: property.ownerId,
      title: "New Property Visit Request",
      body: `A renter requested a tour for "${property.title}" on ${new Date(validated.date).toLocaleDateString("en-IN")} at ${validated.time}.`,
      type: "INFO",
    });

    return NextResponse.json(tour, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    console.error("POST /api/tours error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { UpdateTourSchema } from "@/lib/validations/tour";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/tours/[id]
 * Update tour status (confirm/cancel/reschedule/complete).
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireAuth();
    const { id } = await params;

    const tour = await prisma.tour.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Only the tour requester or property owner can update
    if (tour.userId !== userId && tour.property.ownerId !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const validated = UpdateTourSchema.parse(body);

    const updated = await prisma.tour.update({
      where: { id },
      data: {
        ...(validated.status && { status: validated.status }),
        ...(validated.date && { date: new Date(validated.date) }),
        ...(validated.time && { time: validated.time }),
        ...(validated.tourCompleted !== undefined && { tourCompleted: validated.tourCompleted }),
        ...(validated.completedDate && { completedDate: new Date(validated.completedDate) }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    console.error("PATCH /api/tours/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/tours/[id]
 * Cancel and remove a tour.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireAuth();
    const { id } = await params;

    const tour = await prisma.tour.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    if (tour.userId !== userId && tour.property.ownerId !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.tour.delete({ where: { id } });

    return NextResponse.json({ message: "Tour cancelled" });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("DELETE /api/tours/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

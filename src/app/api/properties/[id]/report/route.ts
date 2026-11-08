import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { CreateReportSchema } from "@/lib/validations/review";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/properties/[id]/report
 * Report a property listing as fake, misleading, or abusive.
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

    // Prevent duplicate reports from same user
    const existingReport = await prisma.report.findFirst({
      where: { propertyId: id, reporterId: userId },
    });
    if (existingReport) {
      return NextResponse.json({ error: "You have already reported this property" }, { status: 409 });
    }

    const body = await request.json();
    const validated = CreateReportSchema.parse(body);

    const report = await prisma.report.create({
      data: {
        reason: validated.reason,
        propertyId: id,
        reporterId: userId,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    console.error("POST /api/properties/[id]/report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

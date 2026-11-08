import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/leads
 * Fetch all leads for the current logged-in owner.
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    const leads = await prisma.lead.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leads);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("GET /api/leads error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/leads
 * Create a new lead.
 * Body: { name, email, phone, notes, propertyName, rentAmount, status }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();

    const { name, email, phone, notes, propertyName, rentAmount, status } = body;

    if (!name || !email || !propertyName || !rentAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone: phone || null,
        notes: notes || null,
        propertyName,
        rentAmount: parseFloat(rentAmount),
        status: status || "NEW",
        ownerId: userId,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("POST /api/leads error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

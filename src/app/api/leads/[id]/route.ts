import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

type Params = {
  params: Promise<{ id: string }>;
};

/**
 * PUT /api/leads/[id]
 * Update a lead (status, notes, etc.)
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const userId = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (lead.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedData: any = {};
    if (body.name !== undefined) updatedData.name = body.name;
    if (body.email !== undefined) updatedData.email = body.email;
    if (body.phone !== undefined) updatedData.phone = body.phone;
    if (body.notes !== undefined) updatedData.notes = body.notes;
    if (body.propertyName !== undefined) updatedData.propertyName = body.propertyName;
    if (body.rentAmount !== undefined) updatedData.rentAmount = parseFloat(body.rentAmount);
    if (body.status !== undefined) updatedData.status = body.status;

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("PUT /api/leads/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/leads/[id]
 * Delete a lead.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const userId = await requireAuth();
    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (lead.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("DELETE /api/leads/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

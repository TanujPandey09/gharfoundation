import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

type Params = {
  params: Promise<{ id: string }>;
};

/**
 * PUT /api/leases/[id]
 * Update a lease agreement (status, details, etc.)
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const userId = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const lease = await prisma.leaseAgreement.findUnique({
      where: { id },
    });

    if (!lease) {
      return NextResponse.json({ error: "Lease agreement not found" }, { status: 404 });
    }

    if (lease.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedData: any = {};
    if (body.tenantName !== undefined) updatedData.tenantName = body.tenantName;
    if (body.tenantEmail !== undefined) updatedData.tenantEmail = body.tenantEmail;
    if (body.propertyName !== undefined) updatedData.propertyName = body.propertyName;
    if (body.propertyCity !== undefined) updatedData.propertyCity = body.propertyCity;
    if (body.startDate !== undefined) updatedData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updatedData.endDate = new Date(body.endDate);
    if (body.rent !== undefined) updatedData.rent = parseFloat(body.rent);
    if (body.status !== undefined) updatedData.status = body.status;

    const updatedLease = await prisma.leaseAgreement.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(updatedLease);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("PUT /api/leases/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/leases/[id]
 * Delete a lease agreement.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const userId = await requireAuth();
    const { id } = await params;

    const lease = await prisma.leaseAgreement.findUnique({
      where: { id },
    });

    if (!lease) {
      return NextResponse.json({ error: "Lease agreement not found" }, { status: 404 });
    }

    if (lease.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.leaseAgreement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("DELETE /api/leases/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

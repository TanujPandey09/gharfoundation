import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const agreements = await prisma.leaseAgreement.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      agreements,
      template: {
        title: "Standard Uttarakhand 11-Month Leave & License Agreement",
        validityMonths: 11,
        stampDutyGuidance: "Execute on ₹100 or ₹500 non-judicial e-Stamp paper from StockHolding Uttarakhand / CSC.",
      },
    });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({
      success: true,
      agreements: [],
      template: {
        title: "Standard Uttarakhand 11-Month Leave & License Agreement",
        validityMonths: 11,
        stampDutyGuidance: "Execute on ₹100 or ₹500 non-judicial e-Stamp paper from StockHolding Uttarakhand / CSC.",
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await req.json();
    const { tenantName, tenantEmail, propertyName, propertyCity, rent, startDate, endDate } = body;

    if (!tenantName || !propertyName || !rent) {
      return NextResponse.json({ error: "Missing required agreement fields" }, { status: 400 });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 11 * 30 * 24 * 60 * 60 * 1000);

    const agreement = await prisma.leaseAgreement.create({
      data: {
        tenantName,
        tenantEmail: tenantEmail || "tenant@gharfoundation.com",
        propertyName,
        propertyCity: propertyCity || "Dehradun",
        rent: Number(rent),
        startDate: start,
        endDate: end,
        status: "ACTIVE",
        ownerId: userId,
      },
    });

    return NextResponse.json({ success: true, agreement }, { status: 201 });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    console.error("POST /api/agreements error:", err);
    return NextResponse.json({ error: "Failed to generate agreement" }, { status: 500 });
  }
}


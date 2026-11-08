import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/leases
 * Fetch lease agreements for the current owner with search, filter, sorting, and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();

    // Query params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const sort = searchParams.get("sort") || "recently_added";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Prisma filter condition
    const whereClause: any = {
      ownerId: userId,
    };

    // Status filter
    if (status !== "ALL") {
      whereClause.status = status;
    }

    // Search query (tenantName, tenantEmail, propertyName, propertyCity)
    if (search) {
      whereClause.OR = [
        { tenantName: { contains: search, mode: "insensitive" } },
        { tenantEmail: { contains: search, mode: "insensitive" } },
        { propertyName: { contains: search, mode: "insensitive" } },
        { propertyCity: { contains: search, mode: "insensitive" } },
      ];
    }

    // Sorting definition
    let orderBy: any = { createdAt: "desc" };
    if (sort === "rent_high") {
      orderBy = { rent: "desc" };
    } else if (sort === "rent_low") {
      orderBy = { rent: "asc" };
    } else if (sort === "end_date") {
      orderBy = { endDate: "asc" };
    }

    // Run parallel count and find queries
    const [total, data] = await prisma.$transaction([
      prisma.leaseAgreement.count({ where: whereClause }),
      prisma.leaseAgreement.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("GET /api/leases error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/leases
 * Create a new lease agreement.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();

    const { tenantName, tenantEmail, propertyName, propertyCity, startDate, endDate, rent, status } = body;

    if (!tenantName || !tenantEmail || !propertyName || !propertyCity || !startDate || !endDate || !rent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lease = await prisma.leaseAgreement.create({
      data: {
        tenantName,
        tenantEmail,
        propertyName,
        propertyCity,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rent: parseFloat(rent),
        status: status || "ACTIVE",
        ownerId: userId,
      },
    });

    return NextResponse.json(lease, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("POST /api/leases error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

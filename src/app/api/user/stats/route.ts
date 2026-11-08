import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/user/stats
 * Get dashboard stats for the owner (total listings, active, views, pending, revenue, occupancy, leads).
 * Supports timeframe filtering via '?timeframe=7|30|90'
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "30";
    const days = parseInt(timeframe, 10) || 30;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);

    const [
      totalListings,
      activeListings,
      pendingVerification,
      totalViewsAgg,
      activeLeasesCount,
      totalRevenueAgg,
      leadsCount
    ] = await Promise.all([
      prisma.property.count({ 
        where: { ownerId: userId, createdAt: { gte: thresholdDate } } 
      }),
      prisma.property.count({ 
        where: { ownerId: userId, isVerified: true, createdAt: { gte: thresholdDate } } 
      }),
      prisma.property.count({ 
        where: { ownerId: userId, isVerified: false, createdAt: { gte: thresholdDate } } 
      }),
      prisma.property.aggregate({
        where: { ownerId: userId, createdAt: { gte: thresholdDate } },
        _sum: { viewsCount: true },
      }),
      prisma.leaseAgreement.count({
        where: { ownerId: userId, status: "ACTIVE", createdAt: { gte: thresholdDate } },
      }),
      prisma.leaseAgreement.aggregate({
        where: { ownerId: userId, status: "ACTIVE", createdAt: { gte: thresholdDate } },
        _sum: { rent: true },
      }),
      prisma.lead.count({
        where: { ownerId: userId, createdAt: { gte: thresholdDate } },
      }),
    ]);

    const totalViews = totalViewsAgg._sum.viewsCount || 0;
    const totalRevenue = totalRevenueAgg._sum.rent || 0;
    const avgOccupancy = totalListings > 0 
      ? Math.min(100, Math.round((activeLeasesCount / totalListings) * 100))
      : 0;

    return NextResponse.json({
      totalListings,
      activeListings,
      pendingVerification,
      totalViews,
      totalRevenue,
      avgOccupancy,
      leadsCount,
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("GET /api/user/stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

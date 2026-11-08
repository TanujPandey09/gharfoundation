import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/notifications
 * Get all notifications for the current user.
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to last 50
    });

    return NextResponse.json(notifications);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications
 * Mark notification(s) as read.
 * Body: { ids: string[] } or { markAllRead: true }
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();

    if (body.markAllRead) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ message: "All notifications marked as read" });
    }

    if (body.ids && Array.isArray(body.ids)) {
      await prisma.notification.updateMany({
        where: {
          id: { in: body.ids },
          userId, // Ensure user can only mark their own
        },
        data: { isRead: true },
      });
      return NextResponse.json({ message: "Notifications marked as read" });
    }

    return NextResponse.json({ error: "Provide ids array or markAllRead: true" }, { status: 400 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

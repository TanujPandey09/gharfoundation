import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { dispatchSystemNotification } from "@/lib/services/notifications";

/**
 * GET /api/messages
 * Get message threads for the current user.
 * Returns messages grouped by conversation partner.
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(messages);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("GET /api/messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/messages
 * Send a message to another user.
 * Body: { receiverId: string, content: string, propertyId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();

    if (!body.receiverId || !body.content) {
      return NextResponse.json({ error: "receiverId and content are required" }, { status: 400 });
    }

    if (body.receiverId === userId) {
      return NextResponse.json({ error: "Cannot send message to yourself" }, { status: 400 });
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: body.receiverId } });
    if (!receiver) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: userId,
        receiverId: body.receiverId,
        content: body.content,
        propertyId: body.propertyId || null,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
      },
    });

    await dispatchSystemNotification({
      userId: body.receiverId,
      title: `New message from ${message.sender?.name || "Ghar Foundation User"}`,
      body: body.content.slice(0, 120),
      type: "CHAT",
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

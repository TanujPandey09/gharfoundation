import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, ensureUserInDb } from "@/lib/auth";
import { dispatchSystemNotification } from "@/lib/services/notifications";

/**
 * GET /api/payments
 * Returns the authenticated user's payment history, active subscription, and active leases.
 */
export async function GET() {
  try {
    const userId = await requireAuth();
    await ensureUserInDb(userId);

    const [payments, subscriptions, leases, propertiesCount] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.leaseAgreement.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.property.count({ where: { ownerId: userId } }),
    ]);

    const activeSubscription =
      subscriptions.find((s) => s.status === "ACTIVE") || null;

    return NextResponse.json({
      payments,
      activeSubscription,
      leases,
      propertiesCount,
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("GET /api/payments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/payments
 * Records a subscription plan change or rent/listing payment in PostgreSQL.
 * Body: { amount: number, purpose: string, planName?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    await ensureUserInDb(userId);

    const body = await request.json();
    const amount = Number(body.amount ?? 0);
    const purpose = String(body.purpose || "Subscription Upgrade");
    const planName = body.planName as string | undefined;

    if (isNaN(amount) || amount < 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
    }

    const transactionId = `TXN-GHAR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        status: "SUCCESS",
        transactionId,
        purpose,
      },
    });

    let subscription = null;
    if (planName) {
      // Mark previous active subscriptions as CANCELLED
      await prisma.subscription.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { status: "CANCELLED" },
      });

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      subscription = await prisma.subscription.create({
        data: {
          userId,
          planName,
          status: "ACTIVE",
          startDate: new Date(),
          endDate,
          pricePaid: amount,
        },
      });
    }

    await dispatchSystemNotification({
      userId,
      title: "Payment Confirmed",
      body: `₹${amount.toLocaleString("en-IN")} processed for ${purpose} (${transactionId}).`,
      type: "TRANSACTION",
    });

    return NextResponse.json({
      success: true,
      payment,
      subscription,
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("POST /api/payments error:", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}


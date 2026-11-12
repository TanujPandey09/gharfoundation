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
 * Records a verified rent ledger entry (for HRA tax receipts) in PostgreSQL.
 * Paid platform subscriptions are disabled during early launch (all features are free).
 * Body: { amount: number, purpose: string, planName?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    await ensureUserInDb(userId);

    const body = await request.json();
    const amount = Number(body.amount ?? 0);
    const purpose = String(body.purpose || "Monthly Rent Payment");
    const planName = body.planName as string | undefined;

    // Disallow fake paid subscription upgrades
    if (planName && planName !== "free" && amount > 0) {
      return NextResponse.json(
        {
          error: "Online payment gateway is not live yet. All premium hosting features and listings are currently 100% FREE for early launch users.",
        },
        { status: 400 }
      );
    }

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Please enter a valid payment amount" }, { status: 400 });
    }

    // Generate compliant rent ledger receipt ID
    const receiptId = `REC-RENT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        status: "RECORDED",
        transactionId: receiptId,
        purpose,
      },
    });

    await dispatchSystemNotification({
      userId,
      title: "Rent Receipt Recorded",
      body: `₹${amount.toLocaleString("en-IN")} recorded under Rent Ledger (${receiptId}) for ${purpose}.`,
      type: "TRANSACTION",
    });

    return NextResponse.json({
      success: true,
      payment,
      message: "Rent payment recorded in ledger successfully.",
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("POST /api/payments error:", error);
    return NextResponse.json({ error: "Failed to record payment entry" }, { status: 500 });
  }
}



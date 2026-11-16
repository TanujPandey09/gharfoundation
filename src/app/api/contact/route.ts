import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "anon";
    const rl = await checkRateLimit(`contact:${ip}`, 5, 600); // 5 messages per 10 mins
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many messages sent. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = ContactSchema.parse(body);

    const submission = await prisma.contactSubmission.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        subject: validated.subject || "General Inquiry",
        message: validated.message,
        status: "UNREAD",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for reaching out. Our Dehradun helpdesk will respond within 24 hours.",
        id: submission.id,
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    console.error("POST /api/contact error:", err);
    return NextResponse.json(
      { error: "Failed to submit message. Please try again or reach out on WhatsApp." },
      { status: 500 }
    );
  }
}


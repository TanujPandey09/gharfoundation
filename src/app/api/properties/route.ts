import { NextRequest, NextResponse } from "next/server";
import { requireAuth, ensureUserInDb } from "@/lib/auth";
import { CreatePropertySchema } from "@/lib/validations/property";
import { getProperties } from "@/lib/services/properties";
import { dispatchSystemNotification } from "@/lib/services/notifications";
import { checkRateLimit } from "@/lib/rate-limit";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams.entries());

    const result = await getProperties(filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/properties error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();

    // Rate limiting: Max 10 property posts per hour per user
    const rl = await checkRateLimit(`prop_post:${userId}`, 10, 3600);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: { message: "Property listing limit reached. You can post up to 10 listings per hour." } },
        { status: 429 }
      );
    }

    const user = await ensureUserInDb(userId);

    if (!["OWNER", "BROKER", "ADMIN"].includes(user.role)) {
      // Automatically activate OWNER role for authenticated users creating their first property listing
      await prisma.user.update({
        where: { id: userId },
        data: { role: "OWNER", activeWorkspace: "HOSTING" },
      });
    }

    const body = await request.json();
    const validated = CreatePropertySchema.parse(body);

    const { amenities, imageUrls, availableFrom, ...propertyData } = validated;

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
        ownerId: userId,
        amenities: amenities
          ? { create: amenities.map((name) => ({ name })) }
          : undefined,
        images: imageUrls
          ? { create: imageUrls.map((url) => ({ url })) }
          : undefined,
      },
      include: {
        images: true,
        amenities: true,
        owner: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    });

    await dispatchSystemNotification({
      userId,
      title: "Property Published Live",
      body: `"${property.title}" in ${property.city} is now live on Ghar Foundation.`,
      type: "APPROVAL",
    });

    return NextResponse.json({ success: true, data: property }, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error; 
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: { message: "Validation failed", details: error } },
        { status: 400 }
      );
    }
    console.error("POST /api/properties error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}

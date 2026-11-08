import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * POST /api/user/tenant-profile
 * Creates or updates the TenantProfile upon guided onboarding completion.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { preferredCity, budgetMin, budgetMax, moveInDate, occupation, monthlyIncome, familySize, preferredPropertyType, furnishedPreference, hasPets, language } = body;

    const profile = await prisma.tenantProfile.upsert({
      where: { userId },
      create: {
        userId,
        preferredCity: preferredCity || null,
        budgetMin: budgetMin ? parseFloat(budgetMin) : null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        moveInDate: moveInDate ? new Date(moveInDate) : null,
        occupation: occupation || null,
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : null,
        familySize: familySize ? parseInt(familySize, 10) : 1,
        preferredPropertyType: preferredPropertyType || null,
        furnishedPreference: furnishedPreference || null,
        hasPets: hasPets !== undefined ? !!hasPets : false,
        language: language || "en",
      },
      update: {
        preferredCity: preferredCity !== undefined ? preferredCity : undefined,
        budgetMin: budgetMin !== undefined ? (budgetMin ? parseFloat(budgetMin) : null) : undefined,
        budgetMax: budgetMax !== undefined ? (budgetMax ? parseFloat(budgetMax) : null) : undefined,
        moveInDate: moveInDate !== undefined ? (moveInDate ? new Date(moveInDate) : null) : undefined,
        occupation: occupation !== undefined ? occupation : undefined,
        monthlyIncome: monthlyIncome !== undefined ? (monthlyIncome ? parseFloat(monthlyIncome) : null) : undefined,
        familySize: familySize !== undefined ? parseInt(familySize, 10) : undefined,
        preferredPropertyType: preferredPropertyType !== undefined ? preferredPropertyType : undefined,
        furnishedPreference: furnishedPreference !== undefined ? furnishedPreference : undefined,
        hasPets: hasPets !== undefined ? !!hasPets : undefined,
        language: language !== undefined ? language : undefined,
      },
    });

    // Set user onboarding status and active workspace
    await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingStatus: "COMPLETED",
        activeWorkspace: "SEARCH",
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("POST /api/user/tenant-profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

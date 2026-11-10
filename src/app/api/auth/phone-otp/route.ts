import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  normalizePhone,
  createOtpChallenge,
  verifyOtpChallenge,
  createSignedSession,
} from "@/lib/server-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone: rawPhone, code, firstName, lastName } = body;

    if (!rawPhone || typeof rawPhone !== "string") {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    const digits = rawPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      return NextResponse.json(
        { error: "Phone number must be at least 10 digits." },
        { status: 400 }
      );
    }

    const phone = normalizePhone(rawPhone);

    // ─────────────────────────────────────────────────────────────
    // 1. SEND OTP ACTION
    // ─────────────────────────────────────────────────────────────
    if (action === "SEND") {
      // Rate limiting: Max 5 OTP requests per 10 minutes per IP/phone
      const clientIp = getClientIp(req);
      const [ipLimit, phoneLimit] = await Promise.all([
        checkRateLimit(`otp_send_ip:${clientIp}`, 5, 600),
        checkRateLimit(`otp_send_phone:${phone}`, 5, 600),
      ]);

      if (!ipLimit.success || !phoneLimit.success) {
        return NextResponse.json(
          { error: "Too many verification requests. Please wait 10 minutes before trying again." },
          { status: 429 }
        );
      }

      // Cooldown check (prevent rapid automated spam within 30s)
      const lastSentTime = req.cookies.get("ghar_otp_cd")?.value;
      if (lastSentTime) {
        const elapsed = Date.now() - Number(lastSentTime);
        if (elapsed < 30000) {
          const waitSecs = Math.ceil((30000 - elapsed) / 1000);
          return NextResponse.json(
            { error: `Please wait ${waitSecs} seconds before requesting a new code.` },
            { status: 429 }
          );
        }
      }

      // Cryptographically random 6-digit OTP
      const randomValues = new Uint32Array(1);
      crypto.getRandomValues(randomValues);
      const generatedCode = (100000 + (randomValues[0] % 900000)).toString();

      // Create stateless HMAC-signed challenge token
      const { token, expiresAt } = await createOtpChallenge(phone, generatedCode);

      // Secure server logging (NEVER exposed to browser / client JSON)
      if (process.env.NODE_ENV !== "production") {
        console.log(`[SECURE-AUTH] OTP generated for ${phone}: ${generatedCode}`);
      }

      const response = NextResponse.json({
        success: true,
        phone,
        message: `6-digit verification code sent to ${phone}`,
      });

      // Set challenge cookie (HTTP-only, SameSite=Lax, Secure in prod)
      response.cookies.set("ghar_otp_chlg", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(expiresAt),
      });

      // Set cooldown cookie (30 seconds)
      response.cookies.set("ghar_otp_cd", Date.now().toString(), {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 30,
      });

      return response;
    }

    // ─────────────────────────────────────────────────────────────
    // 2. VERIFY OTP ACTION
    // ─────────────────────────────────────────────────────────────
    if (action === "VERIFY") {
      // Rate limiting: Max 10 verification attempts per 10 minutes per IP/phone
      const clientIp = getClientIp(req);
      const verifyLimit = await checkRateLimit(`otp_verify:${phone}:${clientIp}`, 10, 600);
      if (!verifyLimit.success) {
        return NextResponse.json(
          { error: "Too many verification attempts. Please wait 10 minutes before trying again." },
          { status: 429 }
        );
      }

      if (!code || String(code).trim().length !== 6) {
        return NextResponse.json(
          { error: "Please enter the complete 6-digit OTP code." },
          { status: 400 }
        );
      }

      const challengeToken = req.cookies.get("ghar_otp_chlg")?.value;
      const result = await verifyOtpChallenge(challengeToken, phone, String(code));

      if (!result.valid) {
        const errorResponse = NextResponse.json(
          { error: result.error || "Invalid verification code. Please try again." },
          { status: 400 }
        );

        // Update challenge token if attempts remain
        if (result.nextToken) {
          errorResponse.cookies.set("ghar_otp_chlg", result.nextToken, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
        }
        return errorResponse;
      }

      // Find or create user in PostgreSQL by phone
      let user = await prisma.user.findFirst({
        where: { phone },
        include: {
          ownerProfile: true,
          tenantProfile: true,
        },
      });

      let isNewUser = false;
      if (!user) {
        isNewUser = true;
        const phoneSuffix = phone.slice(-4);
        const displayName =
          [firstName, lastName].filter(Boolean).join(" ").trim() ||
          `Resident ${phoneSuffix}`;

        user = await prisma.user.create({
          data: {
            id: `usr_${phone.replace(/\D/g, "")}`,
            name: displayName,
            phone,
            role: "RENTER",
            activeWorkspace: "SEARCH",
            onboardingStatus: "NOT_STARTED",
          },
          include: {
            ownerProfile: true,
            tenantProfile: true,
          },
        });
      }

      // Generate cryptographically signed 30-day session token
      const sessionToken = await createSignedSession(user.id);

      const response = NextResponse.json({
        success: true,
        isNewUser,
        user,
      });

      // Clear the OTP challenge cookie
      response.cookies.set("ghar_otp_chlg", "", {
        path: "/",
        httpOnly: true,
        maxAge: 0,
      });

      // Set cryptographically signed session cookie
      response.cookies.set("ghar_session", sessionToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      // Also set backward-compatible signed phone session
      response.cookies.set("ghar_phone_uid", sessionToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/auth/phone-otp error:", error);
    return NextResponse.json(
      { error: "Failed to process mobile verification. Please try again." },
      { status: 500 }
    );
  }
}

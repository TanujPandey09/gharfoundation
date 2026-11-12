import { requireAuth } from "./auth";
import prisma from "./prisma";
import { NextResponse } from "next/server";

/**
 * Ensures the requesting user has administrative privileges.
 * Permitted if user.role === 'ADMIN' OR user.email matches ADMIN_EMAILS in .env.
 */
export async function requireAdmin() {
  const userId = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    throw new NextResponse(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isEmailAdmin = !!(user.email && adminEmails.includes(user.email.toLowerCase()));
  const isAdminRole = user.role === "ADMIN";

  if (!isAdminRole && !isEmailAdmin) {
    throw new NextResponse(
      JSON.stringify({ error: "Forbidden: Administrator privileges required to access this resource" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return user;
}


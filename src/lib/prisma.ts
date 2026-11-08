import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton
 * In development, Next.js hot-reloads modules frequently.
 * Without a singleton, each reload creates a new PrismaClient,
 * eventually exhausting database connections.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

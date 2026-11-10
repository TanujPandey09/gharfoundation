/**
 * Production-ready rate limiter for Ghar Foundation API routes.
 * 
 * Supports:
 * 1. Distributed Upstash Redis (when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set).
 * 2. In-memory sliding-window counter fallback with automatic garbage collection for single-node / dev environments.
 */

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory sliding-window bucket store
interface MemoryRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, MemoryRecord>();

// Periodic garbage collection every 5 minutes to prevent memory leaks
let lastCleanup = Date.now();
function cleanupMemoryStore(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < 60000) return; // run at most once per minute
  lastCleanup = now;

  for (const [key, record] of memoryStore.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
    if (record.timestamps.length === 0) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Check and record a rate limit hit for a given identifier.
 * 
 * @param identifier - Unique key (e.g. `otp:ip_or_phone`, `msg:userId`)
 * @param limit - Maximum allowed hits within the window (e.g. 5)
 * @param windowSeconds - Window duration in seconds (e.g. 60 for 1 minute)
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // 1. Upstash Redis (if configured in production)
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const key = `ratelimit:${identifier}`;
      // Execute multi-command pipeline via Upstash REST API
      const pipelineRes = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, windowSeconds, "NX"],
          ["TTL", key],
        ]),
      });

      if (pipelineRes.ok) {
        const results = await pipelineRes.json();
        const count = results[0]?.result ?? 1;
        const ttl = results[2]?.result ?? windowSeconds;

        return {
          success: count <= limit,
          limit,
          remaining: Math.max(0, limit - count),
          reset: Math.max(0, ttl),
        };
      }
    } catch (err) {
      console.warn("[RateLimit] Upstash Redis hit failed, falling back to memory:", err);
    }
  }

  // 2. In-memory sliding-window counter
  cleanupMemoryStore(windowMs);

  let record = memoryStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(identifier, record);
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const reset = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.max(1, reset),
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    reset: windowSeconds,
  };
}

/**
 * Helper to extract client IP from Next.js request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

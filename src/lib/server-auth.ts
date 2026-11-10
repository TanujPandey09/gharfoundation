/**
 * Cryptographic Server Authentication & Session Management
 *
 * Runs across both Node.js API routes and Next.js Edge Middleware
 * using the standard global Web Crypto API.
 */

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.CLERK_SECRET_KEY ||
  "ghar_foundation_prod_hmac_secret_2026_secured";

/**
 * Normalizes an Indian or international phone number to E.164 standard.
 * Cleans leading zeros, spaces, dashes, and duplicate +91 country prefixes.
 */
export function normalizePhone(rawPhone: string): string {
  let digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return rawPhone.startsWith("+") ? rawPhone : `+${digits}`;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signData(data: string, secret: string = AUTH_SECRET): Promise<string> {
  const key = await getHmacKey(secret);
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifySignature(
  data: string,
  signature: string,
  secret: string = AUTH_SECRET
): Promise<boolean> {
  try {
    const expected = await signData(data, secret);
    if (expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

async function hashString(value: string): Promise<string> {
  const enc = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", enc.encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generates an HMAC-signed session token for authenticated mobile OTP users.
 * Valid for 30 days. Format: `${userId}.${expiresAt}.${signature}`
 */
export async function createSignedSession(userId: string): Promise<string> {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const payload = `${userId}.${expiresAt}`;
  const sig = await signData(payload, AUTH_SECRET);
  return `${payload}.${sig}`;
}

/**
 * Verifies a signed session token. Returns the authenticated userId if valid, or null.
 */
export async function verifySignedSession(
  token: string | null | undefined
): Promise<string | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userId, expiresAtStr, sig] = parts;
  const expiresAt = Number(expiresAtStr);

  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return null; // Expired
  }

  const payload = `${userId}.${expiresAtStr}`;
  const isValid = await verifySignature(payload, sig, AUTH_SECRET);

  return isValid ? userId : null;
}

/**
 * Creates a stateless, signed OTP challenge token.
 * Valid for 5 minutes. No code is stored in server memory or sent to client.
 */
export async function createOtpChallenge(
  phone: string,
  code: string
): Promise<{ token: string; expiresAt: number }> {
  const normPhone = normalizePhone(phone);
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  const codeHash = await hashString(`${normPhone}:${code}:${AUTH_SECRET}`);
  const payload = `${normPhone}.${expiresAt}.0.${codeHash}`;
  const sig = await signData(payload, AUTH_SECRET);

  return {
    token: `${payload}.${sig}`,
    expiresAt,
  };
}

/**
 * Verifies a submitted OTP code against the signed challenge token.
 * Prevents brute force (max 5 attempts).
 */
export async function verifyOtpChallenge(
  token: string | null | undefined,
  phone: string,
  submittedCode: string
): Promise<{ valid: boolean; error?: string; nextToken?: string }> {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "No active verification request. Please request a new code." };
  }

  const parts = token.split(".");
  if (parts.length !== 5) {
    return { valid: false, error: "Invalid challenge format. Please request a new code." };
  }

  const [chPhone, expiresAtStr, attemptsStr, codeHash, sig] = parts;
  const expiresAt = Number(expiresAtStr);
  const attempts = Number(attemptsStr);

  // 1. Verify token signature
  const payload = `${chPhone}.${expiresAtStr}.${attemptsStr}.${codeHash}`;
  const isSigValid = await verifySignature(payload, sig, AUTH_SECRET);
  if (!isSigValid) {
    return { valid: false, error: "Invalid or tampered verification token." };
  }

  // 2. Check phone match
  if (normalizePhone(chPhone) !== normalizePhone(phone)) {
    return { valid: false, error: "Phone number mismatch. Please request a new code." };
  }

  // 3. Check expiration
  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return { valid: false, error: "Verification code has expired. Please request a new one." };
  }

  // 4. Rate-limit attempts (max 5)
  if (isNaN(attempts) || attempts >= 5) {
    return { valid: false, error: "Too many failed attempts. Please request a new code." };
  }

  // 5. Compare submitted code hash
  const expectedHash = await hashString(`${normalizePhone(phone)}:${submittedCode.trim()}:${AUTH_SECRET}`);
  if (expectedHash === codeHash) {
    return { valid: true };
  }

  // Increment failed attempts and re-sign
  const nextAttempts = attempts + 1;
  const nextPayload = `${chPhone}.${expiresAtStr}.${nextAttempts}.${codeHash}`;
  const nextSig = await signData(nextPayload, AUTH_SECRET);

  return {
    valid: false,
    error: `Incorrect code. ${5 - nextAttempts} attempt${5 - nextAttempts === 1 ? "" : "s"} remaining.`,
    nextToken: `${nextPayload}.${nextSig}`,
  };
}

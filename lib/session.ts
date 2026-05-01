import type { NextRequest } from "next/server";

export type AppUserRole = "student" | "faculty" | "admin";

export interface SessionPayload {
  userId: string;
  uniqueId: string;
  email: string;
  role: AppUserRole;
  issuedAt: number;
  enrollmentNo?: string;
  employeeId?: string;
  adminId?: string;
  firstName?: string;
  lastName?: string;
}

import * as crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "fallback_unsafe_secret_for_dev_only_12345";

export function createSessionToken(payload: Omit<SessionPayload, "issuedAt">): string {
  const value: SessionPayload = {
    ...payload,
    issuedAt: Date.now(),
  };

  const data = Buffer.from(JSON.stringify(value)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function decodeSessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    
    const [data, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
    
    // Constant time comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as Partial<SessionPayload>;

    if (
      typeof parsed.userId !== "string" ||
      typeof parsed.uniqueId !== "string" ||
      typeof parsed.email !== "string" ||
      (parsed.role !== "student" && parsed.role !== "faculty" && parsed.role !== "admin") ||
      typeof parsed.issuedAt !== "number"
    ) {
      return null;
    }

    return parsed as SessionPayload;
  } catch {
    return null;
  }
}

export function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

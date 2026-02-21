import type { NextRequest } from "next/server";

export type AppUserRole = "student" | "faculty" | "admin";

export interface SessionPayload {
  userId: string;
  uniqueId: string;
  email: string;
  role: AppUserRole;
  issuedAt: number;
}

export function createSessionToken(payload: Omit<SessionPayload, "issuedAt">): string {
  const value: SessionPayload = {
    ...payload,
    issuedAt: Date.now(),
  };

  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export function decodeSessionToken(token: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as Partial<SessionPayload>;

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

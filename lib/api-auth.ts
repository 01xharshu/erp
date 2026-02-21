import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { decodeSessionToken, getBearerToken, SessionPayload } from "@/lib/session";

export function getSessionFromRequest(request: NextRequest): SessionPayload | null {
  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  return decodeSessionToken(token);
}

export function requireSession(request: NextRequest): SessionPayload | NextResponse {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  return session;
}

export function requireStudentSession(request: NextRequest): SessionPayload | NextResponse {
  const session = requireSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  if (session.role !== "student") {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden",
      },
      { status: 403 }
    );
  }

  return session;
}

export function requireAdminSession(request: NextRequest): SessionPayload | NextResponse {
  const session = requireSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  if (session.role !== "admin") {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden",
      },
      { status: 403 }
    );
  }

  return session;
}

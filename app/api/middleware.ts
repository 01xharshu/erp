import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Global API error handler
 * This file handles all API errors consistently
 */

export function apiErrorHandler(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: "An unknown error occurred",
    },
    { status: 500 }
  );
}

/**
 * Check authentication token
 */
export function checkAuth(request: NextRequest): string | null {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  return token || null;
}

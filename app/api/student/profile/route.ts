import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { mockStudent } from "@/lib/mockData";

/**
 * API route for fetching student profile
 * Note: This is a mock implementation for demo purposes
 */

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Return mock student data
    return NextResponse.json(
      {
        success: true,
        data: mockStudent,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

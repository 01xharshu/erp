import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * API route for handling authentication
 * Note: This is a mock implementation for demo purposes
 * Replace with actual authentication logic
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enrollmentNo, password } = body;

    // Mock credentials validation
    if (enrollmentNo === "EN2024001" && password === "password123") {
      return NextResponse.json(
        {
          success: true,
          token: Buffer.from(`${enrollmentNo}:${Date.now()}`).toString("base64"),
          message: "Authentication successful",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid credentials",
      },
      { status: 401 }
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

export async function GET() {
  return NextResponse.json(
    {
      message: "Authentication API endpoint",
      methods: ["POST"],
    },
    { status: 200 }
  );
}

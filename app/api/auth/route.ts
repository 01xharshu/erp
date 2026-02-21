import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { findStudentByEnrollment, verifyPassword } from "@/lib/db-models";

/**
 * API route for handling authentication
 * Validates credentials against MongoDB
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enrollmentNo, password } = body;

    if (!enrollmentNo || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Enrollment number and password are required",
        },
        { status: 400 }
      );
    }

    // Get database and find student
    const db = await getDatabase();
    const student = await findStudentByEnrollment(db, enrollmentNo);

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, student.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // Generate token (you can use JWT for better security in production)
    const token = Buffer.from(`${enrollmentNo}:${student._id}:${Date.now()}`).toString("base64");

    return NextResponse.json(
      {
        success: true,
        token,
        student: {
          enrollmentNo: student.enrollmentNo,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          department: student.department,
          semester: student.semester,
          cgpa: student.cgpa,
        },
        message: "Authentication successful",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Auth error:", error);
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

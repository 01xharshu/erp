import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { enrollmentId, password } = await request.json();

    if (!enrollmentId || !password) {
      return NextResponse.json(
        { error: "Enrollment ID and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ enrollmentId });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid enrollment ID or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid enrollment ID or password" },
        { status: 401 }
      );
    }

    user.lastLogin = new Date();
    await user.save();

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: user.toJSON(),
      },
      { status: 200 }
    );

    response.cookies.set("user", JSON.stringify(user.toJSON()), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

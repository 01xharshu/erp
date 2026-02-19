import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { enrollmentId, name, email, password, role, department, semester } = await request.json();

    if (!enrollmentId || !name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      $or: [{ enrollmentId }, { email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const newUser = new User({
      enrollmentId,
      name,
      email,
      password,
      role: role || "student",
      department: department || "General",
      semester: semester || 1,
    });

    await newUser.save();

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: newUser.toJSON(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

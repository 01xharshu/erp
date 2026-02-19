import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Create test users
    const testUsers = [
      {
        enrollmentId: "EN2024001",
        name: "Aarav Singh",
        email: "aarav.singh@college.edu",
        password: "password123",
        role: "student",
        department: "Computer Science",
        semester: 3,
        phone: "9876543210",
      },
      {
        enrollmentId: "EN2024002",
        name: "Priya Sharma",
        email: "priya.sharma@college.edu",
        password: "password123",
        role: "student",
        department: "Information Technology",
        semester: 2,
        phone: "9876543211",
      },
      {
        enrollmentId: "FAC001",
        name: "Dr. Rajesh Kumar",
        email: "rajesh.kumar@college.edu",
        password: "password123",
        role: "faculty",
        department: "Computer Science",
        phone: "9876543212",
      },
      {
        enrollmentId: "ADM001",
        name: "Admin User",
        email: "admin@college.edu",
        password: "password123",
        role: "admin",
        department: "Administration",
        phone: "9876543213",
      },
    ];

    const createdUsers = [];
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ enrollmentId: userData.enrollmentId });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user.toJSON());
      }
    }

    return NextResponse.json(
      {
        message: "Seed data created successfully",
        users: createdUsers,
        total: createdUsers.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed data", details: String(error) },
      { status: 500 }
    );
  }
}

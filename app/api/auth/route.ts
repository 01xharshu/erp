import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { Admin, Faculty, Student, findUserByIdentifier, verifyPassword } from "@/lib/db-models";
import { createSessionToken } from "@/lib/session";

/**
 * API route for handling authentication
 * Validates credentials for student, faculty, and admin users.
 */

type AuthResponseUser = {
  id: string;
  role: "student" | "faculty" | "admin";
  uniqueId: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  department?: string;
  semester?: number;
  year?: number;
  cgpa?: number;
  program?: string;
  rollNo?: string;
  enrollmentNo?: string;
  employeeId?: string;
  adminId?: string;
  dateOfBirth?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  photoURL?: string;
  admissionDate?: string;
  lastLogin?: string;
};

const getAcademicYear = (semester: number): number => Math.max(1, Math.ceil(semester / 2));

const buildStudentUser = (student: Student): AuthResponseUser => {
  const semester = student.semester;
  const year = student.year ?? getAcademicYear(semester);
  const fullName = `${student.firstName} ${student.lastName}`.trim();

  return {
    id: student._id?.toString() || student.enrollmentNo,
    role: "student",
    uniqueId: student.enrollmentNo,
    enrollmentNo: student.enrollmentNo,
    email: student.email,
    firstName: student.firstName,
    lastName: student.lastName,
    name: fullName,
    phone: student.phone,
    department: student.department,
    semester,
    year,
    cgpa: student.cgpa,
    program: student.program ?? `B.Tech (${student.department})`,
    rollNo: student.rollNo ?? student.enrollmentNo.slice(-3),
    dateOfBirth: student.dateOfBirth ?? "2004-01-01",
    address: student.address ?? "Address not set",
    guardianName: student.guardianName ?? "Guardian Name",
    guardianPhone: student.guardianPhone ?? "N/A",
    photoURL: student.photoURL ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
    admissionDate: student.admissionDate ?? "2023-07-01",
    lastLogin: new Date().toISOString(),
  };
};

const buildFacultyUser = (faculty: Faculty): AuthResponseUser => {
  const fullName = `${faculty.firstName} ${faculty.lastName}`.trim();
  return {
    id: faculty._id?.toString() || faculty.employeeId,
    role: "faculty",
    uniqueId: faculty.employeeId,
    employeeId: faculty.employeeId,
    email: faculty.email,
    firstName: faculty.firstName,
    lastName: faculty.lastName,
    name: fullName,
    phone: faculty.phone,
    department: faculty.department,
  };
};

const buildAdminUser = (admin: Admin): AuthResponseUser => {
  const fullName = `${admin.firstName} ${admin.lastName}`.trim();
  return {
    id: admin._id?.toString() || admin.adminId,
    role: "admin",
    uniqueId: admin.adminId,
    adminId: admin.adminId,
    email: admin.email,
    firstName: admin.firstName,
    lastName: admin.lastName,
    name: fullName,
    phone: admin.phone,
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = String(body.identifier ?? body.enrollmentNo ?? "").trim();
    const password = String(body.password ?? "");

    if (!identifier || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email/ID and password are required",
        },
        { status: 400 }
      );
    }

    // Find matching user by email or role-specific ID.
    const db = await getDatabase();
    const matched = await findUserByIdentifier(db, identifier);

    if (!matched) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, matched.user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    const authUser =
      matched.role === "student"
        ? buildStudentUser(matched.user as Student)
        : matched.role === "faculty"
          ? buildFacultyUser(matched.user as Faculty)
          : buildAdminUser(matched.user as Admin);

    const token = createSessionToken({
      userId: authUser.id,
      uniqueId: authUser.uniqueId,
      email: authUser.email,
      role: authUser.role,
    });

    return NextResponse.json(
      {
        success: true,
        token,
        user: authUser,
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

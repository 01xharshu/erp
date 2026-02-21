import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { createStudent, deleteStudent, findAnyUserByEmail, findStudentByEnrollment, getAllStudents, updateStudent, updateStudentPassword } from "@/lib/db-models";
import { getNextEnrollmentNo } from "@/lib/id-rules";
import { getDatabase } from "@/lib/mongodb";

const toNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toYearFromSemester = (semester: number): number => Math.max(1, Math.ceil(semester / 2));

const serializeStudent = (student: Awaited<ReturnType<typeof findStudentByEnrollment>>): Record<string, unknown> | null => {
  if (!student) {
    return null;
  }

  const { _id, password, ...rest } = student;
  return {
    _id: _id?.toString() ?? "",
    ...rest,
  };
};

export async function GET(request: NextRequest) {
  const auth = requireAdminSession(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const db = await getDatabase();
    const students = await getAllStudents(db);
    const data = students.map((student) => serializeStudent(student));

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Failed to fetch students:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch students",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdminSession(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const body = await request.json();

    const email = String(body.email ?? "").trim().toLowerCase();
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const password = String(body.password ?? "");

    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, name, and password are required",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const existingByEmail = await findAnyUserByEmail(db, email);

    if (existingByEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already exists",
        },
        { status: 409 }
      );
    }

    const semester = toNumber(body.semester, 1);
    let student = null;
    let generatedEnrollmentNo = "";

    for (let attempt = 0; attempt < 3; attempt += 1) {
      generatedEnrollmentNo = await getNextEnrollmentNo(db);
      try {
        student = await createStudent(db, {
          enrollmentNo: generatedEnrollmentNo,
          email,
          firstName,
          lastName,
          password,
          phone: String(body.phone ?? "").trim(),
          department: String(body.department ?? "General").trim(),
          semester,
          year: toNumber(body.year, toYearFromSemester(semester)),
          cgpa: toNumber(body.cgpa, 0),
          rollNo: String(body.rollNo ?? generatedEnrollmentNo.slice(-3)).trim(),
          program: String(body.program ?? "").trim() || undefined,
          dateOfBirth: String(body.dateOfBirth ?? "").trim() || undefined,
          address: String(body.address ?? "").trim() || undefined,
          guardianName: String(body.guardianName ?? "").trim() || undefined,
          guardianPhone: String(body.guardianPhone ?? "").trim() || undefined,
          photoURL: String(body.photoURL ?? "").trim() || undefined,
          admissionDate: String(body.admissionDate ?? "").trim() || undefined,
          lastLogin: new Date().toISOString(),
        });
        break;
      } catch (error: unknown) {
        const maybeMongo = error as { code?: number };
        if (maybeMongo?.code === 11000 && attempt < 2) {
          continue;
        }
        throw error;
      }
    }

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to auto-generate enrollment number. Please retry.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: serializeStudent(student),
        message: `Student created successfully with Enrollment No ${generatedEnrollmentNo}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] Failed to create student:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create student",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAdminSession(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const body = await request.json();
    const enrollmentNo = String(body.enrollmentNo ?? "").trim();

    if (!enrollmentNo) {
      return NextResponse.json(
        {
          success: false,
          message: "Enrollment number is required",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const existing = await findStudentByEnrollment(db, enrollmentNo);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    const nextEmail = body.email ? String(body.email).trim().toLowerCase() : undefined;
    if (nextEmail && nextEmail !== existing.email) {
      const existingByEmail = await findAnyUserByEmail(db, nextEmail);
      if (existingByEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "Email already exists",
          },
          { status: 409 }
        );
      }
    }

    const semester = body.semester !== undefined ? toNumber(body.semester, existing.semester) : existing.semester;
    const year = body.year !== undefined ? toNumber(body.year, existing.year ?? toYearFromSemester(semester)) : existing.year ?? toYearFromSemester(semester);

    const updated = await updateStudent(db, enrollmentNo, {
      email: nextEmail,
      firstName: body.firstName ? String(body.firstName).trim() : undefined,
      lastName: body.lastName ? String(body.lastName).trim() : undefined,
      phone: body.phone !== undefined ? String(body.phone).trim() : undefined,
      department: body.department !== undefined ? String(body.department).trim() : undefined,
      semester,
      year,
      cgpa: body.cgpa !== undefined ? toNumber(body.cgpa, existing.cgpa) : existing.cgpa,
      rollNo: body.rollNo !== undefined ? String(body.rollNo).trim() : existing.rollNo,
      program: body.program !== undefined ? String(body.program).trim() : existing.program,
      dateOfBirth: body.dateOfBirth !== undefined ? String(body.dateOfBirth).trim() : existing.dateOfBirth,
      address: body.address !== undefined ? String(body.address).trim() : existing.address,
      guardianName: body.guardianName !== undefined ? String(body.guardianName).trim() : existing.guardianName,
      guardianPhone: body.guardianPhone !== undefined ? String(body.guardianPhone).trim() : existing.guardianPhone,
      photoURL: body.photoURL !== undefined ? String(body.photoURL).trim() : existing.photoURL,
      admissionDate: body.admissionDate !== undefined ? String(body.admissionDate).trim() : existing.admissionDate,
      lastLogin: existing.lastLogin,
    });

    const password = String(body.password ?? "").trim();
    if (password) {
      await updateStudentPassword(db, enrollmentNo, password);
    }

    return NextResponse.json(
      {
        success: true,
        data: serializeStudent(updated),
        message: "Student updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Failed to update student:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update student",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireAdminSession(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const enrollmentNo = request.nextUrl.searchParams.get("enrollmentNo")?.trim();

    if (!enrollmentNo) {
      return NextResponse.json(
        {
          success: false,
          message: "Enrollment number is required",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const deleted = await deleteStudent(db, enrollmentNo);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Student deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Failed to delete student:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete student",
      },
      { status: 500 }
    );
  }
}

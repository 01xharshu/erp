import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { createFaculty, deleteFaculty, findAnyUserByEmail, findFacultyByEmployeeId, getAllFaculty, updateFaculty, updateFacultyPassword } from "@/lib/db-models";
import { getNextFacultyEmployeeId } from "@/lib/id-rules";
import { getDatabase } from "@/lib/mongodb";

const serializeFaculty = (faculty: Awaited<ReturnType<typeof findFacultyByEmployeeId>>): Record<string, unknown> | null => {
  if (!faculty) {
    return null;
  }

  const { _id, password, ...rest } = faculty;
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
    const faculty = await getAllFaculty(db);
    const data = faculty.map((member) => serializeFaculty(member));

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Failed to fetch faculty:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch faculty",
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

    let created = null;
    let generatedEmployeeId = "";

    for (let attempt = 0; attempt < 3; attempt += 1) {
      generatedEmployeeId = await getNextFacultyEmployeeId(db);
      try {
        created = await createFaculty(db, {
          employeeId: generatedEmployeeId,
          email,
          firstName,
          lastName,
          password,
          phone: String(body.phone ?? "").trim(),
          department: String(body.department ?? "General").trim(),
          designation: String(body.designation ?? "Lecturer").trim(),
          specialization: String(body.specialization ?? "General").trim(),
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

    if (!created) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to auto-generate employee ID. Please retry.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: serializeFaculty(created),
        message: `Faculty created successfully with Employee ID ${generatedEmployeeId}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] Failed to create faculty:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create faculty",
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
    const employeeId = String(body.employeeId ?? "").trim();

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee ID is required",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const existing = await findFacultyByEmployeeId(db, employeeId);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Faculty member not found",
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

    const updated = await updateFaculty(db, employeeId, {
      email: nextEmail,
      firstName: body.firstName ? String(body.firstName).trim() : undefined,
      lastName: body.lastName ? String(body.lastName).trim() : undefined,
      phone: body.phone !== undefined ? String(body.phone).trim() : undefined,
      department: body.department !== undefined ? String(body.department).trim() : undefined,
      designation: body.designation !== undefined ? String(body.designation).trim() : undefined,
      specialization: body.specialization !== undefined ? String(body.specialization).trim() : undefined,
    });

    const password = String(body.password ?? "").trim();
    if (password) {
      await updateFacultyPassword(db, employeeId, password);
    }

    return NextResponse.json(
      {
        success: true,
        data: serializeFaculty(updated),
        message: "Faculty updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Failed to update faculty:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update faculty",
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
    const employeeId = request.nextUrl.searchParams.get("employeeId")?.trim();
    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee ID is required",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const deleted = await deleteFaculty(db, employeeId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Faculty member not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Faculty deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Failed to delete faculty:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete faculty",
      },
      { status: 500 }
    );
  }
}

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { 
  createAdmin, 
  deleteAdmin, 
  findAnyUserByEmail, 
  getAllAdmins, 
  updateAdmin, 
  updateAdminPassword 
} from "@/lib/db-models";
import { getDatabase } from "@/lib/mongodb";

const serializeAdmin = (admin: any) => {
  if (!admin) return null;
  const { _id, password, ...rest } = admin;
  return {
    _id: _id?.toString() ?? "",
    ...rest,
  };
};

export async function GET(request: NextRequest) {
  const auth = requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const db = await getDatabase();
    const admins = await getAllAdmins(db);
    return NextResponse.json({
      success: true,
      data: admins.map(serializeAdmin),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { email, firstName, lastName, password, adminId, phone } = body;

    if (!email || !firstName || !lastName || !password || !adminId) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    const db = await getDatabase();
    const exists = await findAnyUserByEmail(db, email);
    if (exists) return NextResponse.json({ success: false, message: "Email already exists" }, { status: 409 });

    const admin = await createAdmin(db, {
      adminId,
      email,
      firstName,
      lastName,
      password,
      phone: phone || "",
      permissions: ["super_admin"],
    });

    return NextResponse.json({ success: true, data: serializeAdmin(admin) });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { adminId, password, ...data } = body;

    if (!adminId) return NextResponse.json({ success: false, message: "Admin ID required" }, { status: 400 });

    const db = await getDatabase();
    const updated = await updateAdmin(db, adminId, data);
    
    if (password?.trim()) {
      await updateAdminPassword(db, adminId, password);
    }

    return NextResponse.json({ success: true, data: serializeAdmin(updated) });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireAdminSession(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const adminId = request.nextUrl.searchParams.get("adminId");
    if (!adminId) return NextResponse.json({ success: false, message: "Admin ID required" }, { status: 400 });

    const db = await getDatabase();
    await deleteAdmin(db, adminId);
    return NextResponse.json({ success: true, message: "Admin deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}

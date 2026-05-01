import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getSystemMeta, updateSystemMeta } from "@/lib/db-models";
import { requireAdminSession } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = requireAdminSession(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const db = await getDatabase();
    const meta = await getSystemMeta(db);
    return NextResponse.json({ success: true, data: meta });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdminSession(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const db = await getDatabase();
    await updateSystemMeta(db, body);
    const updated = await getSystemMeta(db);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getAllNotices, createNotice, deleteNotice } from "@/lib/db-models";
import { requireSession, requireAdminSession } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const db = await getDatabase();
    const notices = await getAllNotices(db, auth.role);
    return NextResponse.json({ success: true, data: notices });
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
    const notice = await createNotice(db, {
      ...body,
      noticeId: `N-${Date.now()}`
    });
    return NextResponse.json({ success: true, data: notice });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdminSession(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const noticeId = req.nextUrl.searchParams.get("noticeId");
    if (!noticeId) throw new Error("noticeId required");
    const db = await getDatabase();
    await deleteNotice(db, noticeId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

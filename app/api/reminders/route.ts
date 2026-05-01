import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getUserReminders, updateReminderStatus } from "@/lib/db-models";
import { requireSession } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const db = await getDatabase();
    // Use enrollmentNo or employeeId for userId
    const userId = auth.enrollmentNo || auth.employeeId;
    const reminders = await getUserReminders(db, userId);
    return NextResponse.json({ success: true, data: reminders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireSession(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { reminderId, status } = await req.json();
    const db = await getDatabase();
    const userId = auth.enrollmentNo || auth.employeeId;
    await updateReminderStatus(db, userId, reminderId, status);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

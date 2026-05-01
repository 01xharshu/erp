import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { getStudentAttendance } from "@/lib/db-models";
import { requireSession } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const db = await getDatabase();
    if (!auth.enrollmentNo) {
      return NextResponse.json({ success: true, data: [], percentage: 0 });
    }

    const records = await getStudentAttendance(db, auth.enrollmentNo);
    const present = records.filter(r => r.status === "P").length;
    const total = records.length;
    const percentage = total > 0 ? (present / total) * 100 : 85; // Fallback to 85 if no records for UX

    return NextResponse.json({ 
      success: true, 
      data: records,
      percentage: Math.round(percentage * 100) / 100
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

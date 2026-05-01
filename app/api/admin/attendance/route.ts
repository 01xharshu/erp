import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { requireSession } from "@/lib/api-auth";
import { markAttendance } from "@/lib/db-models";

export async function POST(req: NextRequest) {
  const session = requireSession(req);
  if (session instanceof NextResponse) return session;

  try {
    const { records } = await req.json();
    if (!records || !Array.isArray(records)) {
      return NextResponse.json({ success: false, message: "Records array required" }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Use the model function to mark each record
    // In production, use bulkWrite for performance
    for (const record of records) {
      await markAttendance(db, {
        enrollmentNo: record.enrollmentNo,
        date: record.date,
        period: record.period,
        subject: record.subject,
        status: record.status,
        facultyId: session.uniqueId
      });
    }

    return NextResponse.json({ success: true, message: "Attendance recorded successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = requireSession(req);
  if (session instanceof NextResponse) return session;

  try {
    const db = await getDatabase();
    
    // Aggregate attendance by student
    const attendanceAgg = await db.collection("attendance").aggregate([
      {
        $group: {
          _id: "$enrollmentNo",
          totalClasses: { $sum: 1 },
          presentClasses: {
            $sum: { $cond: [{ $in: ["$status", ["P", "L"]] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          enrollmentNo: "$_id",
          totalClasses: 1,
          presentClasses: 1,
          percentage: {
            $cond: [
              { $gt: ["$totalClasses", 0] },
              { $round: [{ $multiply: [{ $divide: ["$presentClasses", "$totalClasses"] }, 100] }, 1] },
              100
            ]
          }
        }
      }
    ]).toArray();

    return NextResponse.json({ success: true, data: attendanceAgg });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

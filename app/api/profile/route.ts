import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { requireSession } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const db = await getDatabase();
    const { uniqueId, role } = auth;

    if (role === "student") {
      const student = await db.collection("students").findOne({ enrollmentNo: uniqueId });
      if (!student) return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
      
      // Fetch dynamic stats
      const [fees, attendance] = await Promise.all([
        db.collection("fees").find({ enrollmentNo: uniqueId }).toArray(),
        db.collection("attendance").find({ enrollmentNo: uniqueId }).toArray(),
      ]);

      const pendingFees = fees.filter(f => f.status !== "Paid").reduce((sum, f) => sum + f.amount, 0);
      
      // Calculate attendance %
      const totalClasses = attendance.length || 1; // avoid / 0
      const presentClasses = attendance.filter(a => a.status === "P").length;
      const attendanceRate = Math.round((presentClasses / totalClasses) * 100);

      return NextResponse.json({
        success: true,
        data: {
          ...student,
          pendingFees,
          attendanceRate,
          totalClasses,
          presentClasses
        }
      });
    } else if (role === "faculty") {
      const faculty = await db.collection("faculty").findOne({ employeeId: uniqueId });
      if (!faculty) return NextResponse.json({ success: false, message: "Faculty not found" }, { status: 404 });
      
      return NextResponse.json({
        success: true,
        data: faculty
      });
    }

    return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

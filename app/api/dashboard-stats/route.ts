import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { requireSession } from "@/lib/api-auth";
import { Notice, Timetable } from "@/lib/db-models";

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const db = await getDatabase();
    
    if (auth.role === "faculty") {
      const employeeId = auth.employeeId;
      
      // Get classes today from timetables
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const today = days[new Date().getDay()];
      
      const timetables = await db.collection<Timetable>("timetables").find({
        "schedule.slots.facultyId": employeeId
      }).toArray();
      
      let classesTodayCount = 0;
      let nextClass = null;
      let earliestTimeStr = "23:59";
      
      timetables.forEach(tt => {
        const todaySchedule = tt.schedule.find(s => s.day === today);
        if (todaySchedule) {
          const mySlots = todaySchedule.slots.filter(s => s.facultyId === employeeId);
          classesTodayCount += mySlots.length;
          
          if (mySlots.length > 0) {
             const firstSlot = mySlots[0];
             // Simple string comparison assuming format "09:00 AM - ..."
             if (firstSlot.time < earliestTimeStr || earliestTimeStr === "23:59") {
                 earliestTimeStr = firstSlot.time;
                 nextClass = `${firstSlot.subject} at ${firstSlot.time.split(" - ")[0]}`;
             }
          }
        }
      });

      // Get unread notices count
      const notices = await db.collection<Notice>("notices").find({
        targetRole: { $in: ["all", "faculty"] }
      }).toArray();
      
      // Assignments grading count (mocked structure until assignment module DB is completed)
      const pendingAssignmentsCount = await db.collection("assignments").countDocuments({ status: "submitted", facultyId: employeeId });

      return NextResponse.json({
        success: true,
        data: {
          classesToday: classesTodayCount,
          nextClass: nextClass || "No more classes today",
          pendingAssignments: pendingAssignmentsCount,
          averageAttendance: "85%", // Placeholder until full attendance matrix is calculated
          unreadMessages: notices.length // Simplistic unread count
        }
      });
    } else {
      // Student Stats
      const enrollmentNo = auth.enrollmentNo;
      
      // Calculate real attendance
      const attendance = await db.collection("attendance").find({ enrollmentNo }).toArray();
      const present = attendance.filter(a => a.status === "P").length;
      const attRate = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 100;
      
      // Calculate pending fees
      const user = await db.collection("students").findOne({ enrollmentNo });
      const pendingFees = user?.pendingFees ?? 0;
      const cgpa = user?.cgpa ?? 0;
      
      return NextResponse.json({
        success: true,
        data: {
          attendancePercentage: attRate,
          cgpa: cgpa > 0 ? cgpa : 0.0,
          pendingFees,
          academicGrade: cgpa > 9 ? "A+" : cgpa > 8 ? "A" : cgpa > 7 ? "B" : "N/A"
        }
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

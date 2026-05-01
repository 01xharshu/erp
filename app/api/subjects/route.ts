import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const session = requireSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const db = await getDatabase();

    if (session.role === "student") {
      const student = await db.collection("students").findOne({ enrollmentNo: session.enrollmentNo });
      const department = student?.department || "Computer Science";
      const semester = student?.semester || 1;

      // In a real robust system, we would query a "subjects" collection.
      // Here, we can map timetables to extract unique subjects for the student.
      const timetables = await db.collection("timetables").find({ department, semester }).toArray();
      const subjectSet = new Set<string>();
      
      timetables.forEach(tt => {
        tt.schedule.forEach((day: any) => {
          day.slots.forEach((slot: any) => {
             subjectSet.add(slot.subject);
          });
        });
      });

      // Map to proper response format
      const subjects = Array.from(subjectSet).map((name, i) => ({
         id: `SUB${i+1}`,
         code: `${department.substring(0, 2).toUpperCase()}-${semester}0${i+1}`,
         name,
         credits: 4,
         type: "Core",
         faculty: "TBD",
         attendance: 0
      }));

      return NextResponse.json({ success: true, data: subjects }, { status: 200 });
    }

    if (session.role === "faculty") {
      const timetables = await db.collection("timetables").find({ "schedule.slots.facultyId": session.employeeId }).toArray();
      const subjectSet = new Set<string>();
      
      timetables.forEach(tt => {
        tt.schedule.forEach((day: any) => {
          day.slots.forEach((slot: any) => {
             if (slot.facultyId === session.employeeId) {
                subjectSet.add(slot.subject);
             }
          });
        });
      });

      const subjects = Array.from(subjectSet).map((name, i) => ({
         id: `SUB${i+1}`,
         code: `FAC-SUB-${i+1}`,
         name,
         credits: 4,
         type: "Core",
      }));

      return NextResponse.json({ success: true, data: subjects }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getDatabase } from "@/lib/mongodb";
import { Timetable, Student } from "@/lib/db-models";

export async function GET(request: NextRequest) {
  const session = requireSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const db = await getDatabase();
    
    // For Students
    if (session.role === "student") {
      const student = await db.collection<Student>("students").findOne({ enrollmentNo: session.uniqueId });
      if (!student || !student.program || !student.semester || !student.section) {
        return NextResponse.json({ success: true, data: [] }, { status: 200 }); // Student hasn't been assigned
      }
      
      const timetable = await db.collection<Timetable>("timetables").findOne({
        program: student.program,
        semester: student.semester,
        section: student.section
      });
      
      if (timetable) {
        // Map faculty names
        const faculties = await db.collection("faculty").find({}).toArray();
        const facultyMap: Record<string, string> = {};
        faculties.forEach(f => facultyMap[f.employeeId] = `${f.firstName} ${f.lastName}`);
        
        timetable.schedule.forEach(day => {
          day.slots.forEach((slot: any) => {
            slot.facultyName = facultyMap[slot.facultyId] || slot.facultyId;
          });
        });
      }
      
      return NextResponse.json({ success: true, data: timetable ? [timetable] : [] }, { status: 200 });
    }

    // For Faculty
    if (session.role === "faculty") {
      // Find all timetables where this faculty acts in any slot
      const allTimetables = await db.collection<Timetable>("timetables").find({}).toArray();
      
      // Filter out slots to only those belonging to current faculty
      const facultyTimetableSchedule = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => ({
        day,
        slots: [] as any[]
      }));

      allTimetables.forEach(timetable => {
        timetable.schedule.forEach(daySchedule => {
          daySchedule.slots.forEach(slot => {
            if (slot.facultyId === session.uniqueId) {
              const targetDay = facultyTimetableSchedule.find(d => d.day === daySchedule.day);
              if (targetDay) {
                targetDay.slots.push({
                  ...slot,
                  facultyName: session.firstName + " " + session.lastName, // It is the current faculty
                  // Also append class context so faculty knows WHICH class this is
                  classContext: `${timetable.program} Sem ${timetable.semester} Sec ${timetable.section}`
                });
              }
            }
          });
        });
      });
      
      // Convert mapping array back exactly into a standard Timetable wrapper
      const mappedTimetable = {
        _id: "faculty-aggregate",
        department: "Cross-Department",
        program: "Multiple",
        semester: 0,
        section: "",
        schedule: facultyTimetableSchedule
      };
      
      return NextResponse.json({ success: true, data: [mappedTimetable] }, { status: 200 });
    }

    // For Admin simply dump all or query by parameters
    return NextResponse.json({ success: false, message: "Use admin route" }, { status: 400 });
  } catch (error) {
    console.error("Failed to fetch timetable:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch timetable" }, { status: 500 });
  }
}

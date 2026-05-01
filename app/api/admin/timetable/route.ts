import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { getDatabase } from "@/lib/mongodb";
import { Timetable } from "@/lib/db-models";

export async function GET(request: NextRequest) {
  const auth = requireAdminSession(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const db = await getDatabase();
    // Allow querying by department, program, semester, section
    const program = request.nextUrl.searchParams.get("program");
    const semester = request.nextUrl.searchParams.get("semester");
    const section = request.nextUrl.searchParams.get("section");
    
    // Build query dynamically
    const query: any = {};
    if (program) query.program = program;
    if (semester) query.semester = Number(semester);
    if (section) query.section = section.toUpperCase();

    const timetables = await db.collection<Timetable>("timetables").find(query).toArray();
    
    return NextResponse.json({ success: true, data: timetables }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch timetables:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch timetables" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdminSession(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const body = await request.json();
    const { department, program, semester, section, schedule, periods } = body;

    if (!program || !semester || !section || !schedule) {
      return NextResponse.json(
        { success: false, message: "Program, semester, section, and schedule are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Ensure section is uppercase
    const normalizedSection = section.toUpperCase();

    // 1. Clash Detection Logic
    // Fetch all existing timetables to prevent faculty from being double-booked
    const allTimetables = await db.collection<Timetable>("timetables").find({}).toArray();
    
    for (const daySchedule of schedule) {
      if (!daySchedule.slots) continue;
      
      for (const slot of daySchedule.slots) {
        if (!slot.facultyId) continue;
        
        // Check against other timetables
        for (const otherTable of allTimetables) {
          // Skip the timetable we are currently editing
          if (
            otherTable.program === program &&
            otherTable.semester === Number(semester) &&
            otherTable.section === normalizedSection
          ) {
            continue;
          }
          
          const otherDay = otherTable.schedule.find(d => d.day === daySchedule.day);
          if (otherDay) {
            const conflictingSlot = otherDay.slots.find(
              s => s.time === slot.time && s.facultyId === slot.facultyId
            );
            
            if (conflictingSlot) {
              const facultyDoc = await db.collection("faculty").findOne({ employeeId: slot.facultyId });
              const facultyName = facultyDoc ? `${facultyDoc.firstName} ${facultyDoc.lastName}` : slot.facultyId;

              return NextResponse.json(
                { 
                  success: false, 
                  message: `Clash Detected: ${facultyName} is already assigned to ${otherTable.program} Sem ${otherTable.semester} Sec ${otherTable.section} on ${daySchedule.day} at ${slot.time}` 
                },
                { status: 400 }
              );
            }
          }
        }
      }
    }
    
    // Find if a timetable already exists for this class
    const existing = allTimetables.find(t => 
      t.program === program && 
      t.semester === Number(semester) && 
      t.section === normalizedSection
    );
    
    let result;
    if (existing) {
      result = await db.collection<Timetable>("timetables").findOneAndUpdate(
        { _id: existing._id },
        { 
          $set: { 
            department: department || existing.department,
            schedule,
            periods: periods || null,
            updatedAt: new Date()
          } 
        },
        { returnDocument: "after" }
      );
    } else {
      const newTimetable: Omit<Timetable, "_id"> = {
        department: department || "General",
        program,
        semester: Number(semester),
        section: normalizedSection,
        periods: periods || null,
        schedule,
        updatedAt: new Date()
      };
      const insertResult = await db.collection<Timetable>("timetables").insertOne(newTimetable);
      result = { ...newTimetable, _id: insertResult.insertedId };
    }

    return NextResponse.json(
      { success: true, data: result, message: "Timetable saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to save timetable:", error);
    return NextResponse.json({ success: false, message: "Failed to save timetable" }, { status: 500 });
  }
}

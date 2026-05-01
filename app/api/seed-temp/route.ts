import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();
    
    // Clear old timetables
    await db.collection("timetables").deleteMany({});

    const classTimetables = [
      {
        department: "Computer Science",
        program: "B.Tech",
        semester: 4,
        section: "A",
        periods: ["09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM", "12:00 PM - 01:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM"],
        schedule: [
          { day: "Monday", slots: [
            { time: "09:00 AM - 10:00 AM", subject: "Data Structures", facultyId: "FAC001", room: "A101" },
            { time: "10:00 AM - 11:00 AM", subject: "Linear Algebra", facultyId: "FAC003", room: "A102" },
            { time: "11:00 AM - 12:00 PM", subject: "Operating Systems", facultyId: "FAC006", room: "A103" },
            { time: "02:00 PM - 03:00 PM", subject: "DS Lab", facultyId: "FAC001", room: "Lab-1" },
          ]},
          { day: "Tuesday", slots: [
            { time: "09:00 AM - 10:00 AM", subject: "Computer Networks", facultyId: "FAC003", room: "B201" },
            { time: "10:00 AM - 11:00 AM", subject: "Data Structures", facultyId: "FAC001", room: "A101" },
            { time: "11:00 AM - 12:00 PM", subject: "Discrete Mathematics", facultyId: "FAC003", room: "A105" },
          ]},
          { day: "Wednesday", slots: [
            { time: "09:00 AM - 10:00 AM", subject: "Operating Systems", facultyId: "FAC006", room: "A103" },
            { time: "10:00 AM - 11:00 AM", subject: "Linear Algebra", facultyId: "FAC003", room: "A102" },
            { time: "02:00 PM - 03:00 PM", subject: "OS Lab", facultyId: "FAC006", room: "Lab-2" },
          ]},
          { day: "Thursday", slots: [
            { time: "09:00 AM - 10:00 AM", subject: "Data Structures", facultyId: "FAC001", room: "A101" },
            { time: "10:00 AM - 11:00 AM", subject: "Computer Networks", facultyId: "FAC003", room: "B201" },
            { time: "11:00 AM - 12:00 PM", subject: "Discrete Mathematics", facultyId: "FAC003", room: "A105" },
          ]},
          { day: "Friday", slots: [
            { time: "09:00 AM - 10:00 AM", subject: "Linear Algebra", facultyId: "FAC003", room: "A102" },
            { time: "10:00 AM - 11:00 AM", subject: "Operating Systems", facultyId: "FAC006", room: "A103" },
            { time: "02:00 PM - 03:00 PM", subject: "CN Lab", facultyId: "FAC003", room: "Lab-3" },
          ]},
        ],
        updatedAt: new Date(),
      }
    ];

    for (const tt of classTimetables) {
      await db.collection("timetables").insertOne(tt);
    }
    
    // Also let's ensure Aarav has the right program/section
    await db.collection("users").updateOne(
      { email: "aarav.kumar@college.ac.in" },
      { $set: { program: "B.Tech", semester: 4, section: "A", department: "Computer Science" } }
    );
    
    await db.collection("users").updateOne(
       { email: "ananya.gupta@college.ac.in" },
       { $set: { employeeId: "FAC001", firstName: "Ananya", lastName: "Gupta" } }
    );

    return NextResponse.json({ success: true, message: "Seeded successfully via API" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

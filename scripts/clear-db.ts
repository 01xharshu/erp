import { getDatabase } from "../lib/mongodb";

async function clearDatabase() {
  try {
    console.log("[v0] Clearing database collections...");
    const db = await getDatabase();

    const [students, faculty, admins, fees, timetable, attendanceLogs, studentAttendance, reminders] = await Promise.all([
      db.collection("students").deleteMany({}),
      db.collection("faculty").deleteMany({}),
      db.collection("admins").deleteMany({}),
      db.collection("fees").deleteMany({}),
      db.collection("timetable").deleteMany({}),
      db.collection("attendance_logs").deleteMany({}),
      db.collection("student_attendance").deleteMany({}),
      db.collection("reminders").deleteMany({}),
    ]);

    console.log(`[v0] Deleted students: ${students.deletedCount}`);
    console.log(`[v0] Deleted faculty: ${faculty.deletedCount}`);
    console.log(`[v0] Deleted admins: ${admins.deletedCount}`);
    console.log(`[v0] Deleted fees: ${fees.deletedCount}`);
    console.log(`[v0] Deleted timetable: ${timetable.deletedCount}`);
    console.log(`[v0] Deleted attendance_logs: ${attendanceLogs.deletedCount}`);
    console.log(`[v0] Deleted student_attendance: ${studentAttendance.deletedCount}`);
    console.log(`[v0] Deleted reminders: ${reminders.deletedCount}`);
    console.log("[v0] Database clear completed.");
    process.exit(0);
  } catch (error) {
    console.error("[v0] Failed to clear database:", error);
    process.exit(1);
  }
}

clearDatabase();

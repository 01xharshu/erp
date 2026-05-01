import { getDatabase } from "../lib/mongodb";
import { createStudent, createFaculty, createAdmin } from "../lib/db-models";
import { createFeeRecord } from "../lib/fee-models";

/**
 * MEGA SEED SCRIPT
 * Populates 30 Faculty, 30 Students, and conflict-free Timetables for all classes.
 */

const PROGRAMS = ["B.Tech", "BCA", "MCA"];
const DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Electrical", "Information Technology", "Civil"];
const SECTIONS = ["A", "B"];
const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM"
];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const SUBJECTS_BY_DEPT: Record<string, string[]> = {
  "Computer Science": ["Data Structures", "Operating Systems", "Algorithms", "Machine Learning", "Cloud Computing", "Database Management", "Artificial Intelligence", "Web Development"],
  "Electronics": ["Signal Processing", "VLSI Design", "Microprocessors", "Embedded Systems", "Control Systems", "Digital Communication", "Electromagnetics"],
  "Mechanical": ["Thermodynamics", "Fluid Mechanics", "Machine Design", "Manufacturing Processes", "Kinematics", "Heat Transfer", "CAD/CAM"],
  "Electrical": ["Power Systems", "Electric Machines", "Network Analysis", "Control Systems", "Power Electronics", "Renewable Energy"],
  "Information Technology": ["Cyber Security", "Information Theory", "Software Engineering", "Mobile Computing", "Network Security", "Big Data Analytics"],
  "Civil": ["Structural Engineering", "Fluid Mechanics", "Geotechnical Engineering", "Surveying", "Construction Management", "Hydrology"]
};

async function seed() {
  try {
    console.log("🚀 Starting Mega Seeding...");
    const db = await getDatabase();

    // Clear existing data
    await Promise.all([
      db.collection("students").deleteMany({}),
      db.collection("faculty").deleteMany({}),
      db.collection("admins").deleteMany({}),
      db.collection("fees").deleteMany({}),
      db.collection("timetables").deleteMany({}),
      db.collection("student_attendance").deleteMany({}),
      db.collection("attendance_logs").deleteMany({}),
      db.collection("system_meta").deleteMany({ type: "academic_structure" })
    ]);
    console.log("🧹 Cleared existing collections");

    // 1. Create Academic Structure
    await db.collection("system_meta").insertOne({
      type: "academic_structure",
      programs: PROGRAMS,
      departments: DEPARTMENTS,
      sections: SECTIONS,
      semesters: [1, 2, 3, 4, 5, 6, 7, 8],
      updatedAt: new Date()
    });

    // 2. Create Admin
    await createAdmin(db, {
      adminId: "ADMIN001",
      email: "admin@college.ac.in",
      firstName: "Super",
      lastName: "Admin",
      password: "Harsh@9410",
      phone: "+91-9999999999",
      permissions: ["manage_all"]
    });

    // 3. Create 30 Faculty
    const facultyList = [];
    for (let i = 1; i <= 30; i++) {
      const dept = DEPARTMENTS[i % DEPARTMENTS.length];
      const f = {
        employeeId: `FAC${String(i).padStart(3, "0")}`,
        email: `faculty${i}@college.ac.in`,
        firstName: `Prof. Name${i}`,
        lastName: `Surname${i}`,
        password: "password123",
        phone: `+91-900000${String(i).padStart(4, "0")}`,
        department: dept,
        designation: i % 5 === 0 ? "Professor" : "Assistant Professor",
        specialization: SUBJECTS_BY_DEPT[dept][0]
      };
      await createFaculty(db, f);
      facultyList.push(f);
    }
    console.log(`👨‍🏫 Created 30 Faculty members`);

    // 4. Create 30 Students
    const studentList = [];
    for (let i = 1; i <= 30; i++) {
      const prog = PROGRAMS[i % PROGRAMS.length];
      const dept = DEPARTMENTS[i % DEPARTMENTS.length];
      const sem = (i % 8) + 1;
      const s = {
        enrollmentNo: `EN2024${String(i).padStart(3, "0")}`,
        rollNo: String(i).padStart(3, "0"),
        email: `student${i}@college.ac.in`,
        firstName: `Student${i}`,
        lastName: `Last${i}`,
        password: "password123",
        phone: `+91-987654${String(i).padStart(4, "0")}`,
        department: dept,
        program: prog,
        semester: sem,
        year: Math.ceil(sem / 2),
        section: SECTIONS[i % SECTIONS.length],
        cgpa: 6.5 + (i % 30) / 10,
        admissionDate: "2024-07-15"
      };
      await createStudent(db, s);
      studentList.push(s);

      // Create some fees
      await createFeeRecord(db, {
        feeId: `FEE-${s.enrollmentNo}-1`,
        enrollmentNo: s.enrollmentNo,
        amount: 45000,
        dueDate: "2026-06-01",
        status: i % 3 === 0 ? "Pending" : "Paid",
        category: "Tuition",
        description: "Semester Fee"
      });
    }
    console.log(`🎓 Created 30 Students`);

    // 5. Generate Conflict-Free Timetables
    // teacherSchedules[employeeId][day][timeSlot] = true
    const teacherSchedules: Record<string, Record<string, Record<string, boolean>>> = {};
    facultyList.forEach(f => {
      teacherSchedules[f.employeeId] = {};
      DAYS.forEach(d => {
        teacherSchedules[f.employeeId][d] = {};
      });
    });

    const classCombinations = [];
    for (const program of PROGRAMS) {
        const maxSem = program === "B.Tech" ? 8 : program === "BCA" ? 6 : 4;
        for (let sem = 1; sem <= maxSem; sem++) {
            for (const section of SECTIONS) {
                for (const dept of DEPARTMENTS) {
                    // Only certain depts for certain programs to keep it simple but realistic
                    if (program === "B.Tech" || dept === "Computer Science" || dept === "Information Technology") {
                        classCombinations.push({ program, semester: sem, section, department: dept });
                    }
                }
            }
        }
    }

    console.log(`📅 Generating timetables for ${classCombinations.length} class combinations...`);

    for (const cls of classCombinations) {
      const schedule = [];
      for (const day of DAYS) {
        const slots = [];
        // Each class gets 3-4 slots per day
        const numSlots = 3 + (Math.floor(Math.random() * 2));
        const availableTimeSlots = [...TIME_SLOTS].sort(() => Math.random() - 0.5).slice(0, numSlots);

        for (const time of availableTimeSlots) {
          // Find a teacher from this dept who is free
          const deptTeachers = facultyList.filter(f => f.department === cls.department);
          const freeTeacher = deptTeachers.find(f => !teacherSchedules[f.employeeId][day][time]);

          if (freeTeacher) {
            const subjects = SUBJECTS_BY_DEPT[cls.department];
            const subject = subjects[Math.floor(Math.random() * subjects.length)];
            const room = `${cls.department.charAt(0)}${100 + Math.floor(Math.random() * 50)}`;

            slots.push({ time, subject, facultyId: freeTeacher.employeeId, room });
            teacherSchedules[freeTeacher.employeeId][day][time] = true;
          }
        }
        if (slots.length > 0) {
            schedule.push({ day, slots });
        }
      }

      if (schedule.length > 0) {
        await db.collection("timetables").insertOne({
            ...cls,
            periods: TIME_SLOTS,
            schedule,
            updatedAt: new Date()
        });
      }
    }

    console.log("✅ Mega Seeding Completed Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Failed:", error);
    process.exit(1);
  }
}

seed();

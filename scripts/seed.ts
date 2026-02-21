import { getDatabase } from "../lib/mongodb";
import { createStudent, createFaculty, createAdmin } from "../lib/db-models";

/**
 * Seed script to populate MongoDB with test data
 * Creates: 1 Admin, 2 Faculty, 3 Students
 * Run with: npm run seed
 */

async function seed() {
  try {
    console.log("[v0] Starting database seeding...");
    const db = await getDatabase();

    // Clear existing collections
    await db.collection("students").deleteMany({});
    await db.collection("faculty").deleteMany({});
    await db.collection("admins").deleteMany({});
    console.log("[v0] Cleared existing data");

    // Create admin
    const testAdmin = {
      adminId: "ADMIN001",
      email: "admin@college.edu",
      firstName: "Admin",
      lastName: "User",
      password: "admin123",
      phone: "+91-9999999999",
      permissions: ["manage_students", "manage_faculty", "manage_system"],
    };
    await createAdmin(db, testAdmin);
    console.log(`[v0] Created admin: ${testAdmin.adminId}`);

    // Test faculty data
    const testFaculty = [
      {
        employeeId: "FAC001",
        email: "faculty1@college.edu",
        firstName: "Dr.",
        lastName: "Patel",
        password: "password123",
        phone: "+91-9888888888",
        department: "Computer Science",
        designation: "Professor",
        specialization: "Data Science",
      },
      {
        employeeId: "FAC002",
        email: "faculty2@college.edu",
        firstName: "Dr.",
        lastName: "Gupta",
        password: "password123",
        phone: "+91-9877777777",
        department: "Electronics",
        designation: "Associate Professor",
        specialization: "Signal Processing",
      },
    ];

    for (const faculty of testFaculty) {
      await createFaculty(db, faculty);
      console.log(`[v0] Created faculty: ${faculty.employeeId}`);
    }

    // Test students data
    const testStudents = [
      {
        enrollmentNo: "EN2024001",
        email: "student1@college.edu",
        firstName: "Harshul",
        lastName: "Sharma",
        password: "password123",
        phone: "+91-9876543210",
        department: "Computer Science",
        semester: 4,
        cgpa: 8.5,
      },
      {
        enrollmentNo: "EN2024002",
        email: "student2@college.edu",
        firstName: "Priya",
        lastName: "Singh",
        password: "password123",
        phone: "+91-9876543211",
        department: "Electronics",
        semester: 3,
        cgpa: 8.2,
      },
      {
        enrollmentNo: "EN2024003",
        email: "student3@college.edu",
        firstName: "Rajesh",
        lastName: "Kumar",
        password: "password123",
        phone: "+91-9876543212",
        department: "Mechanical",
        semester: 2,
        cgpa: 7.8,
      },
    ];

    for (const student of testStudents) {
      await createStudent(db, student);
      console.log(`[v0] Created student: ${student.enrollmentNo}`);
    }

    console.log("\n[v0] Seeding completed successfully!");
    console.log("\n=== ADMIN LOGIN ===");
    console.log("Admin ID: ADMIN001");
    console.log("Password: admin123");
    console.log("\n=== FACULTY LOGIN ===");
    console.log("Faculty ID: FAC001 or FAC002");
    console.log("Password: password123");
    console.log("\n=== STUDENT LOGIN ===");
    console.log("Enrollment: EN2024001, EN2024002, or EN2024003");
    console.log("Password: password123");
    console.log("========================\n");

    process.exit(0);
  } catch (error) {
    console.error("[v0] Seeding failed:", error);
    process.exit(1);
  }
}

seed();

import { getDatabase } from "../lib/mongodb";
import { createStudent, hashPassword } from "../lib/db-models";

/**
 * Seed script to populate MongoDB with test student data
 * Run with: node scripts/seed.mjs
 */

async function seed() {
  try {
    console.log("[v0] Starting database seeding...");
    const db = await getDatabase();

    // Clear existing students collection
    await db.collection("students").deleteMany({});
    console.log("[v0] Cleared existing students");

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

    // Insert test students with hashed passwords
    for (const student of testStudents) {
      const hashedPassword = await hashPassword(student.password);
      await db.collection("students").insertOne({
        ...student,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`[v0] Created student: ${student.enrollmentNo}`);
    }

    console.log("[v0] Seeding completed successfully!");
    console.log("\n=== Test Credentials ===");
    console.log("Enrollment No: EN2024001");
    console.log("Password: password123");
    console.log("\nEnrollment No: EN2024002");
    console.log("Password: password123");
    console.log("\nEnrollment No: EN2024003");
    console.log("Password: password123");
    console.log("========================\n");

    process.exit(0);
  } catch (error) {
    console.error("[v0] Seeding failed:", error);
    process.exit(1);
  }
}

seed();

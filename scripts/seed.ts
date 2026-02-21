import { getDatabase } from "../lib/mongodb";
import { createStudent, createFaculty, createAdmin } from "../lib/db-models";
import { createFeeRecord } from "../lib/fee-models";

/**
 * Seed script to populate MongoDB with test data
 * Creates: 1 Admin, 3 Faculty, 5 Students
 * Run with: npm run seed
 */

async function ensureIndexes() {
  const db = await getDatabase();
  await Promise.all([
    db.collection("students").createIndex({ enrollmentNo: 1 }, { unique: true }),
    db.collection("students").createIndex({ email: 1 }, { unique: true }),
    db.collection("faculty").createIndex({ employeeId: 1 }, { unique: true }),
    db.collection("faculty").createIndex({ email: 1 }, { unique: true }),
    db.collection("admins").createIndex({ adminId: 1 }, { unique: true }),
    db.collection("admins").createIndex({ email: 1 }, { unique: true }),
    db.collection("fees").createIndex({ feeId: 1 }, { unique: true }),
    db.collection("fees").createIndex({ enrollmentNo: 1 }),
    db.collection("fees").createIndex({ status: 1 }),
  ]);
}

const isoDate = (date: Date): string => date.toISOString().split("T")[0];

const buildFeesForStudent = (enrollmentNo: string, semester: number) => {
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setDate(now.getDate() - 10);
  const nearDate = new Date(now);
  nearDate.setDate(now.getDate() + 10);
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + 20);

  return [
    {
      feeId: `${enrollmentNo}-FEE001`,
      enrollmentNo,
      description: `Tuition Fee - Semester ${semester}`,
      category: "Tuition",
      semester,
      amount: 50000,
      dueDate: isoDate(pastDate),
      status: "Paid" as const,
      paidDate: isoDate(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5)),
      modeOfPayment: "Online Transfer" as const,
      gateway: "ERP Legacy",
      paymentId: `pay_seed_${enrollmentNo.toLowerCase()}_001`,
      receiptNo: `RCPT-${enrollmentNo}-001`,
    },
    {
      feeId: `${enrollmentNo}-FEE002`,
      enrollmentNo,
      description: "Examination Fee",
      category: "Examination",
      semester,
      amount: 5000,
      dueDate: isoDate(pastDate),
      status: "Paid" as const,
      paidDate: isoDate(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4)),
      modeOfPayment: "Online Transfer" as const,
      gateway: "ERP Legacy",
      paymentId: `pay_seed_${enrollmentNo.toLowerCase()}_002`,
      receiptNo: `RCPT-${enrollmentNo}-002`,
    },
    {
      feeId: `${enrollmentNo}-FEE003`,
      enrollmentNo,
      description: "Library Fee",
      category: "Library",
      semester,
      amount: 2000,
      dueDate: isoDate(nearDate),
      status: "Pending" as const,
    },
    {
      feeId: `${enrollmentNo}-FEE004`,
      enrollmentNo,
      description: "Lab Fee",
      category: "Laboratory",
      semester,
      amount: 3000,
      dueDate: isoDate(futureDate),
      status: "Pending" as const,
    },
    {
      feeId: `${enrollmentNo}-FEE005`,
      enrollmentNo,
      description: "Activity Fee",
      category: "Activity",
      semester,
      amount: 1500,
      dueDate: isoDate(pastDate),
      status: "Overdue" as const,
    },
  ];
};

async function seed() {
  try {
    console.log("[v0] Starting database seeding...");
    const db = await getDatabase();

    // Clear existing collections
    await db.collection("students").deleteMany({});
    await db.collection("faculty").deleteMany({});
    await db.collection("admins").deleteMany({});
    await db.collection("fees").deleteMany({});
    console.log("[v0] Cleared existing data");

    await ensureIndexes();
    console.log("[v0] Ensured unique indexes");

    // Create admin
    const testAdmin = {
      adminId: "ADMIN001",
      email: "admin@college.ac.in",
      firstName: "System",
      lastName: "Admin",
      password: "admin123",
      phone: "+91-9000000001",
      permissions: ["manage_students", "manage_faculty", "manage_system"],
    };
    await createAdmin(db, testAdmin);
    console.log(`[v0] Created admin: ${testAdmin.adminId}`);

    // Test faculty data
    const testFaculty = [
      {
        employeeId: "FAC001",
        email: "ananya.gupta@college.ac.in",
        firstName: "Ananya",
        lastName: "Gupta",
        password: "password123",
        phone: "+91-9000000101",
        department: "Computer Science",
        designation: "Professor",
        specialization: "Data Structures",
      },
      {
        employeeId: "FAC002",
        email: "vikram.singh@college.ac.in",
        firstName: "Vikram",
        lastName: "Singh",
        password: "password123",
        phone: "+91-9000000102",
        department: "Electronics",
        designation: "Associate Professor",
        specialization: "Signal Processing",
      },
      {
        employeeId: "FAC003",
        email: "priya.sharma@college.ac.in",
        firstName: "Priya",
        lastName: "Sharma",
        password: "password123",
        phone: "+91-9000000103",
        department: "Mathematics",
        designation: "Assistant Professor",
        specialization: "Linear Algebra",
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
        rollNo: "001",
        email: "aarav.kumar@college.ac.in",
        firstName: "Aarav",
        lastName: "Kumar",
        password: "password123",
        phone: "+91-9876543210",
        department: "Computer Science",
        program: "B.Tech Computer Science",
        semester: 4,
        year: 2,
        cgpa: 8.5,
        dateOfBirth: "2004-05-15",
        address: "123 Educational Lane, Delhi",
        guardianName: "Rajesh Kumar",
        guardianPhone: "+91-9876543211",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
        admissionDate: "2023-07-15",
        lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024002",
        rollNo: "002",
        email: "priya.singh@college.ac.in",
        firstName: "Priya",
        lastName: "Singh",
        password: "password123",
        phone: "+91-9876543220",
        department: "Electronics",
        program: "B.Tech Electronics",
        semester: 3,
        year: 2,
        cgpa: 8.2,
        dateOfBirth: "2004-08-20",
        address: "44 Sunrise Apartments, Jaipur",
        guardianName: "Mahesh Singh",
        guardianPhone: "+91-9876543221",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
        admissionDate: "2023-07-15",
        lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024003",
        rollNo: "003",
        email: "rohan.sharma@college.ac.in",
        firstName: "Rohan",
        lastName: "Sharma",
        password: "password123",
        phone: "+91-9876543230",
        department: "Mechanical",
        program: "B.Tech Mechanical",
        semester: 2,
        year: 1,
        cgpa: 7.8,
        dateOfBirth: "2005-01-12",
        address: "8 Green Park, Lucknow",
        guardianName: "Suresh Sharma",
        guardianPhone: "+91-9876543231",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
        admissionDate: "2024-07-20",
        lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024004",
        rollNo: "004",
        email: "neha.patel@college.ac.in",
        firstName: "Neha",
        lastName: "Patel",
        password: "password123",
        phone: "+91-9876543240",
        department: "Mathematics",
        program: "B.Sc Mathematics",
        semester: 4,
        year: 2,
        cgpa: 8.9,
        dateOfBirth: "2004-09-01",
        address: "5 River View, Ahmedabad",
        guardianName: "Kiran Patel",
        guardianPhone: "+91-9876543241",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
        admissionDate: "2023-07-15",
        lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024005",
        rollNo: "005",
        email: "aditya.verma@college.ac.in",
        firstName: "Aditya",
        lastName: "Verma",
        password: "password123",
        phone: "+91-9876543250",
        department: "Computer Science",
        program: "B.Tech Computer Science",
        semester: 6,
        year: 3,
        cgpa: 9.1,
        dateOfBirth: "2003-12-10",
        address: "32 Hill Road, Pune",
        guardianName: "Vikas Verma",
        guardianPhone: "+91-9876543251",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya",
        admissionDate: "2022-07-10",
        lastLogin: new Date().toISOString(),
      },
    ];

    for (const student of testStudents) {
      await createStudent(db, student);
      console.log(`[v0] Created student: ${student.enrollmentNo}`);

      const fees = buildFeesForStudent(student.enrollmentNo, student.semester);
      for (const fee of fees) {
        await createFeeRecord(db, fee);
      }
      console.log(`[v0] Created fees for: ${student.enrollmentNo}`);
    }

    console.log("\n[v0] Seeding completed successfully!");
    console.log("\n=== ADMIN LOGIN ===");
    console.log("Admin ID/Email: ADMIN001 / admin@college.ac.in");
    console.log("Password: admin123");
    console.log("\n=== FACULTY LOGIN ===");
    console.log("Faculty ID/Email: FAC001, FAC002, FAC003 or faculty email");
    console.log("Password: password123");
    console.log("\n=== STUDENT LOGIN ===");
    console.log("Enrollment/Email: EN2024001..EN2024005 or student email");
    console.log("Password: password123");
    console.log("========================\n");

    process.exit(0);
  } catch (error) {
    console.error("[v0] Seeding failed:", error);
    process.exit(1);
  }
}

seed();

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
    db.collection("timetable").createIndex({ entryId: 1 }, { unique: true }),
    db.collection("timetable").createIndex({ role: 1, uniqueId: 1, dayOfWeek: 1 }),
    db.collection("attendance_logs").createIndex({ logId: 1 }, { unique: true }),
    db.collection("attendance_logs").createIndex({ facultyId: 1, date: 1 }),
    db.collection("student_attendance").createIndex({ entryId: 1 }, { unique: true }),
    db.collection("student_attendance").createIndex({ enrollmentNo: 1, date: 1 }),
    db.collection("reminders").createIndex({ reminderId: 1 }, { unique: true }),
    db.collection("reminders").createIndex({ role: 1, uniqueId: 1, status: 1, remindAt: 1 }),
  ]);
}

const isoDate = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

interface TimetableSeed {
  entryId: string;
  role: "student" | "faculty" | "admin";
  uniqueId: string;
  dayOfWeek: number;
  subject: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface AttendanceLogSeed {
  logId: string;
  date: string;
  facultyId: string;
  subject: string;
  semester: number;
  department: string;
  totalStudents: number;
  presentStudents: number;
  status: "taken" | "pending";
}

interface StudentAttendanceSeed {
  entryId: string;
  date: string;
  enrollmentNo: string;
  subject: string;
  status: "P" | "A" | "L";
  markedByFacultyId: string;
  markedAt: string;
}

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

const buildStudentTimetable = (enrollmentNo: string, department: string): TimetableSeed[] => [
  {
    entryId: `${enrollmentNo}-TT-1`,
    role: "student",
    uniqueId: enrollmentNo,
    dayOfWeek: 1,
    subject: `${department} Core Theory`,
    startTime: "09:00",
    endTime: "10:00",
    room: "A101",
  },
  {
    entryId: `${enrollmentNo}-TT-2`,
    role: "student",
    uniqueId: enrollmentNo,
    dayOfWeek: 1,
    subject: "Mathematics",
    startTime: "11:00",
    endTime: "12:00",
    room: "A204",
  },
  {
    entryId: `${enrollmentNo}-TT-3`,
    role: "student",
    uniqueId: enrollmentNo,
    dayOfWeek: 2,
    subject: "Communication Skills",
    startTime: "10:00",
    endTime: "11:00",
    room: "B108",
  },
  {
    entryId: `${enrollmentNo}-TT-4`,
    role: "student",
    uniqueId: enrollmentNo,
    dayOfWeek: 3,
    subject: `${department} Lab`,
    startTime: "14:00",
    endTime: "16:00",
    room: "Lab-3",
  },
  {
    entryId: `${enrollmentNo}-TT-5`,
    role: "student",
    uniqueId: enrollmentNo,
    dayOfWeek: 4,
    subject: "Project / Tutorial",
    startTime: "09:30",
    endTime: "10:30",
    room: "T201",
  },
  {
    entryId: `${enrollmentNo}-TT-6`,
    role: "student",
    uniqueId: enrollmentNo,
    dayOfWeek: 5,
    subject: "Elective",
    startTime: "12:00",
    endTime: "13:00",
    room: "E104",
  },
];

const buildFacultyTimetable = (employeeId: string, specialization: string): TimetableSeed[] => [
  {
    entryId: `${employeeId}-TT-1`,
    role: "faculty",
    uniqueId: employeeId,
    dayOfWeek: 1,
    subject: `${specialization} Lecture`,
    startTime: "09:00",
    endTime: "10:00",
    room: "F101",
  },
  {
    entryId: `${employeeId}-TT-2`,
    role: "faculty",
    uniqueId: employeeId,
    dayOfWeek: 1,
    subject: "Mentoring Session",
    startTime: "13:00",
    endTime: "14:00",
    room: "Mentor-2",
  },
  {
    entryId: `${employeeId}-TT-3`,
    role: "faculty",
    uniqueId: employeeId,
    dayOfWeek: 2,
    subject: `${specialization} Tutorial`,
    startTime: "11:00",
    endTime: "12:00",
    room: "F201",
  },
  {
    entryId: `${employeeId}-TT-4`,
    role: "faculty",
    uniqueId: employeeId,
    dayOfWeek: 3,
    subject: "Office Hours",
    startTime: "15:00",
    endTime: "16:00",
    room: "Cabin-12",
  },
  {
    entryId: `${employeeId}-TT-5`,
    role: "faculty",
    uniqueId: employeeId,
    dayOfWeek: 4,
    subject: "Assessment Review",
    startTime: "10:00",
    endTime: "11:00",
    room: "F104",
  },
];

const buildAdminTimetable = (): TimetableSeed[] => [
  {
    entryId: "ADMIN001-TT-1",
    role: "admin",
    uniqueId: "ADMIN001",
    dayOfWeek: 1,
    subject: "Weekly Ops Review",
    startTime: "09:30",
    endTime: "10:30",
    room: "Board Room",
  },
  {
    entryId: "ADMIN001-TT-2",
    role: "admin",
    uniqueId: "ADMIN001",
    dayOfWeek: 2,
    subject: "Admissions & Records",
    startTime: "11:00",
    endTime: "12:00",
    room: "Admin Office",
  },
  {
    entryId: "ADMIN001-TT-3",
    role: "admin",
    uniqueId: "ADMIN001",
    dayOfWeek: 4,
    subject: "Finance Reconciliation",
    startTime: "15:00",
    endTime: "16:00",
    room: "Finance Desk",
  },
];

const buildAttendanceLogs = (): AttendanceLogSeed[] => {
  const today = isoDate(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = isoDate(yesterdayDate);

  return [
    {
      logId: `ATT-FAC001-${today}-1`,
      date: today,
      facultyId: "FAC001",
      subject: "Data Structures",
      semester: 4,
      department: "Computer Science",
      totalStudents: 45,
      presentStudents: 39,
      status: "taken",
    },
    {
      logId: `ATT-FAC002-${today}-1`,
      date: today,
      facultyId: "FAC002",
      subject: "Signal Processing",
      semester: 3,
      department: "Electronics",
      totalStudents: 38,
      presentStudents: 31,
      status: "taken",
    },
    {
      logId: `ATT-FAC003-${today}-1`,
      date: today,
      facultyId: "FAC003",
      subject: "Linear Algebra",
      semester: 4,
      department: "Mathematics",
      totalStudents: 34,
      presentStudents: 0,
      status: "pending",
    },
    {
      logId: `ATT-FAC001-${yesterday}-1`,
      date: yesterday,
      facultyId: "FAC001",
      subject: "Data Structures",
      semester: 4,
      department: "Computer Science",
      totalStudents: 45,
      presentStudents: 40,
      status: "taken",
    },
  ];
};

const buildStudentAttendance = (enrollmentNo: string, index: number): StudentAttendanceSeed[] => {
  const today = isoDate(new Date());
  const statuses: Array<"P" | "A" | "L"> = ["P", "P", "A", "P", "L"];
  return [
    {
      entryId: `${enrollmentNo}-ATT-1-${today}`,
      date: today,
      enrollmentNo,
      subject: "Core Theory",
      status: statuses[index % statuses.length],
      markedByFacultyId: "FAC001",
      markedAt: new Date().toISOString(),
    },
    {
      entryId: `${enrollmentNo}-ATT-2-${today}`,
      date: today,
      enrollmentNo,
      subject: "Mathematics",
      status: statuses[(index + 1) % statuses.length],
      markedByFacultyId: "FAC003",
      markedAt: new Date().toISOString(),
    },
    {
      entryId: `${enrollmentNo}-ATT-3-${today}`,
      date: today,
      enrollmentNo,
      subject: "Communication Skills",
      status: statuses[(index + 2) % statuses.length],
      markedByFacultyId: "FAC002",
      markedAt: new Date().toISOString(),
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
    await db.collection("timetable").deleteMany({});
    await db.collection("attendance_logs").deleteMany({});
    await db.collection("student_attendance").deleteMany({});
    await db.collection("reminders").deleteMany({});
    console.log("[v0] Cleared existing data");

    await ensureIndexes();
    console.log("[v0] Ensured unique indexes");

    // Create admin
    const testAdmin = {
      adminId: "ADMIN001",
      email: "admin@college.ac.in",
      firstName: "System",
      lastName: "Admin",
      password: "Harsh@9410",
      phone: "+91-9000000001",
      permissions: ["manage_students", "manage_faculty", "manage_system"],
    };
    await createAdmin(db, testAdmin);
    console.log(`[v0] Created admin: ${testAdmin.adminId}`);

    // Test faculty data
    const testFaculty = [
      {
        employeeId: "FAC001", email: "ananya.gupta@college.ac.in", firstName: "Ananya", lastName: "Gupta",
        password: "password123", phone: "+91-9000000101", department: "Computer Science",
        designation: "Professor", specialization: "Data Structures",
      },
      {
        employeeId: "FAC002", email: "vikram.singh@college.ac.in", firstName: "Vikram", lastName: "Singh",
        password: "password123", phone: "+91-9000000102", department: "Electronics",
        designation: "Associate Professor", specialization: "Signal Processing",
      },
      {
        employeeId: "FAC003", email: "priya.sharma@college.ac.in", firstName: "Priya", lastName: "Sharma",
        password: "password123", phone: "+91-9000000103", department: "Computer Science",
        designation: "Assistant Professor", specialization: "Linear Algebra",
      },
      {
        employeeId: "FAC004", email: "rajesh.verma@college.ac.in", firstName: "Rajesh", lastName: "Verma",
        password: "password123", phone: "+91-9000000104", department: "Mechanical",
        designation: "Professor", specialization: "Thermodynamics",
      },
      {
        employeeId: "FAC005", email: "sunita.devi@college.ac.in", firstName: "Sunita", lastName: "Devi",
        password: "password123", phone: "+91-9000000105", department: "Electrical",
        designation: "Associate Professor", specialization: "Power Systems",
      },
      {
        employeeId: "FAC006", email: "amit.pandey@college.ac.in", firstName: "Amit", lastName: "Pandey",
        password: "password123", phone: "+91-9000000106", department: "Information Technology",
        designation: "Assistant Professor", specialization: "Cloud Computing",
      },
      {
        employeeId: "FAC007", email: "kavya.nair@college.ac.in", firstName: "Kavya", lastName: "Nair",
        password: "password123", phone: "+91-9000000107", department: "Civil",
        designation: "Lecturer", specialization: "Structural Engineering",
      },
    ];

    for (const faculty of testFaculty) {
      await createFaculty(db, faculty);
      console.log(`[v0] Created faculty: ${faculty.employeeId}`);

      const facultyTimetable = buildFacultyTimetable(faculty.employeeId, faculty.specialization);
      if (facultyTimetable.length > 0) {
        await db.collection<TimetableSeed>("timetable").insertMany(facultyTimetable);
      }
    }

    // Test students data
    const testStudents = [
      {
        enrollmentNo: "EN2024001", rollNo: "001", email: "aarav.kumar@college.ac.in",
        firstName: "Aarav", lastName: "Kumar", password: "password123", phone: "+91-9876543210",
        department: "Computer Science", program: "B.Tech", semester: 4, year: 2, section: "A",
        cgpa: 8.5, dateOfBirth: "2004-05-15", address: "123 Educational Lane, Delhi",
        guardianName: "Rajesh Kumar", guardianPhone: "+91-9876543211",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav", admissionDate: "2023-07-15", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024002", rollNo: "002", email: "priya.singh@college.ac.in",
        firstName: "Priya", lastName: "Singh", password: "password123", phone: "+91-9876543220",
        department: "Electronics", program: "B.Tech", semester: 4, year: 2, section: "A",
        cgpa: 8.2, dateOfBirth: "2004-08-20", address: "44 Sunrise Apartments, Jaipur",
        guardianName: "Mahesh Singh", guardianPhone: "+91-9876543221",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya", admissionDate: "2023-07-15", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024003", rollNo: "003", email: "rohan.sharma@college.ac.in",
        firstName: "Rohan", lastName: "Sharma", password: "password123", phone: "+91-9876543230",
        department: "Mechanical", program: "B.Tech", semester: 2, year: 1, section: "A",
        cgpa: 7.8, dateOfBirth: "2005-01-12", address: "8 Green Park, Lucknow",
        guardianName: "Suresh Sharma", guardianPhone: "+91-9876543231",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan", admissionDate: "2024-07-20", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024004", rollNo: "004", email: "neha.patel@college.ac.in",
        firstName: "Neha", lastName: "Patel", password: "password123", phone: "+91-9876543240",
        department: "Computer Science", program: "B.Tech", semester: 4, year: 2, section: "A",
        cgpa: 8.9, dateOfBirth: "2004-09-01", address: "5 River View, Ahmedabad",
        guardianName: "Kiran Patel", guardianPhone: "+91-9876543241",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha", admissionDate: "2023-07-15", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024005", rollNo: "005", email: "aditya.verma@college.ac.in",
        firstName: "Aditya", lastName: "Verma", password: "password123", phone: "+91-9876543250",
        department: "Computer Science", program: "B.Tech", semester: 6, year: 3, section: "A",
        cgpa: 9.1, dateOfBirth: "2003-12-10", address: "32 Hill Road, Pune",
        guardianName: "Vikas Verma", guardianPhone: "+91-9876543251",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya", admissionDate: "2022-07-10", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024006", rollNo: "006", email: "sneha.reddy@college.ac.in",
        firstName: "Sneha", lastName: "Reddy", password: "password123", phone: "+91-9876543260",
        department: "Computer Science", program: "B.Tech", semester: 4, year: 2, section: "B",
        cgpa: 7.2, dateOfBirth: "2004-03-22", address: "12 MG Road, Hyderabad",
        guardianName: "Ramesh Reddy", guardianPhone: "+91-9876543261",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha", admissionDate: "2023-07-15", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024007", rollNo: "007", email: "vikash.yadav@college.ac.in",
        firstName: "Vikash", lastName: "Yadav", password: "password123", phone: "+91-9876543270",
        department: "Electrical", program: "B.Tech", semester: 2, year: 1, section: "A",
        cgpa: 6.5, dateOfBirth: "2005-06-18", address: "78 Station Road, Patna",
        guardianName: "Ravi Yadav", guardianPhone: "+91-9876543271",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikash", admissionDate: "2024-07-20", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024008", rollNo: "008", email: "ananya.mishra@college.ac.in",
        firstName: "Ananya", lastName: "Mishra", password: "password123", phone: "+91-9876543280",
        department: "Information Technology", program: "B.Tech", semester: 6, year: 3, section: "A",
        cgpa: 8.7, dateOfBirth: "2003-11-05", address: "34 Lake View, Bhopal",
        guardianName: "Dinesh Mishra", guardianPhone: "+91-9876543281",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya", admissionDate: "2022-07-10", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024009", rollNo: "009", email: "rahul.joshi@college.ac.in",
        firstName: "Rahul", lastName: "Joshi", password: "password123", phone: "+91-9876543290",
        department: "Civil", program: "B.Tech", semester: 4, year: 2, section: "A",
        cgpa: 7.0, dateOfBirth: "2004-07-30", address: "56 Temple Road, Varanasi",
        guardianName: "Manoj Joshi", guardianPhone: "+91-9876543291",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul", admissionDate: "2023-07-15", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024010", rollNo: "010", email: "kavita.nair@college.ac.in",
        firstName: "Kavita", lastName: "Nair", password: "password123", phone: "+91-9876543300",
        department: "Computer Science", program: "BCA", semester: 2, year: 1, section: "A",
        cgpa: 8.0, dateOfBirth: "2005-02-14", address: "90 Beach Road, Kochi",
        guardianName: "Sunil Nair", guardianPhone: "+91-9876543301",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita", admissionDate: "2024-07-20", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024011", rollNo: "011", email: "arjun.mehta@college.ac.in",
        firstName: "Arjun", lastName: "Mehta", password: "password123", phone: "+91-9876543310",
        department: "Mechanical", program: "B.Tech", semester: 4, year: 2, section: "B",
        cgpa: 6.8, dateOfBirth: "2004-04-10", address: "23 Industrial Area, Chandigarh",
        guardianName: "Sanjay Mehta", guardianPhone: "+91-9876543311",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun", admissionDate: "2023-07-15", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024012", rollNo: "012", email: "deepika.chauhan@college.ac.in",
        firstName: "Deepika", lastName: "Chauhan", password: "password123", phone: "+91-9876543320",
        department: "Electronics", program: "B.Tech", semester: 6, year: 3, section: "A",
        cgpa: 9.3, dateOfBirth: "2003-08-25", address: "67 Civil Lines, Dehradun",
        guardianName: "Prakash Chauhan", guardianPhone: "+91-9876543321",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepika", admissionDate: "2022-07-10", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024013", rollNo: "013", email: "manish.tiwari@college.ac.in",
        firstName: "Manish", lastName: "Tiwari", password: "password123", phone: "+91-9876543330",
        department: "Computer Science", program: "MCA", semester: 2, year: 1, section: "A",
        cgpa: 7.5, dateOfBirth: "2002-10-08", address: "45 University Road, Indore",
        guardianName: "Ashok Tiwari", guardianPhone: "+91-9876543331",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Manish", admissionDate: "2024-07-20", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024014", rollNo: "014", email: "pooja.saxena@college.ac.in",
        firstName: "Pooja", lastName: "Saxena", password: "password123", phone: "+91-9876543340",
        department: "Information Technology", program: "B.Tech", semester: 4, year: 2, section: "A",
        cgpa: 8.4, dateOfBirth: "2004-01-19", address: "89 Nehru Nagar, Agra",
        guardianName: "Vivek Saxena", guardianPhone: "+91-9876543341",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja", admissionDate: "2023-07-15", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024015", rollNo: "015", email: "kunal.das@college.ac.in",
        firstName: "Kunal", lastName: "Das", password: "password123", phone: "+91-9876543350",
        department: "Electrical", program: "B.Tech", semester: 4, year: 2, section: "A",
        cgpa: 5.9, dateOfBirth: "2004-12-03", address: "12 Park Street, Kolkata",
        guardianName: "Tapan Das", guardianPhone: "+91-9876543351",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kunal", admissionDate: "2023-07-15", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024016", rollNo: "016", email: "ritu.agarwal@college.ac.in",
        firstName: "Ritu", lastName: "Agarwal", password: "password123", phone: "+91-9876543360",
        department: "Computer Science", program: "B.Tech", semester: 8, year: 4, section: "A",
        cgpa: 9.5, dateOfBirth: "2002-09-17", address: "34 Mall Road, Kanpur",
        guardianName: "Lalit Agarwal", guardianPhone: "+91-9876543361",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ritu", admissionDate: "2021-07-10", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024017", rollNo: "017", email: "siddharth.kapoor@college.ac.in",
        firstName: "Siddharth", lastName: "Kapoor", password: "password123", phone: "+91-9876543370",
        department: "Mechanical", program: "B.Tech", semester: 6, year: 3, section: "A",
        cgpa: 7.3, dateOfBirth: "2003-05-28", address: "78 Rajpur Road, Dehradun",
        guardianName: "Vinod Kapoor", guardianPhone: "+91-9876543371",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siddharth", admissionDate: "2022-07-10", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024018", rollNo: "018", email: "meera.iyer@college.ac.in",
        firstName: "Meera", lastName: "Iyer", password: "password123", phone: "+91-9876543380",
        department: "Civil", program: "B.Tech", semester: 2, year: 1, section: "A",
        cgpa: 8.1, dateOfBirth: "2005-04-11", address: "56 Anna Nagar, Chennai",
        guardianName: "Venkatesh Iyer", guardianPhone: "+91-9876543381",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meera", admissionDate: "2024-07-20", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024019", rollNo: "019", email: "tarun.bhatt@college.ac.in",
        firstName: "Tarun", lastName: "Bhatt", password: "password123", phone: "+91-9876543390",
        department: "Electronics", program: "B.Tech", semester: 2, year: 1, section: "B",
        cgpa: 6.2, dateOfBirth: "2005-07-22", address: "90 Tilak Road, Nagpur",
        guardianName: "Hemant Bhatt", guardianPhone: "+91-9876543391",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tarun", admissionDate: "2024-07-20", lastLogin: new Date().toISOString(),
      },
      {
        enrollmentNo: "EN2024020", rollNo: "020", email: "ishita.roy@college.ac.in",
        firstName: "Ishita", lastName: "Roy", password: "password123", phone: "+91-9876543400",
        department: "Computer Science", program: "B.Tech", semester: 4, year: 2, section: "A",
        cgpa: 4.8, dateOfBirth: "2004-11-29", address: "11 Gariahat Road, Kolkata",
        guardianName: "Debashish Roy", guardianPhone: "+91-9876543401",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ishita", admissionDate: "2023-07-15", lastLogin: new Date().toISOString(),
      },
    ];

    for (const [index, student] of testStudents.entries()) {
      await createStudent(db, student);
      console.log(`[v0] Created student: ${student.enrollmentNo}`);

      const fees = buildFeesForStudent(student.enrollmentNo, student.semester);
      for (const fee of fees) {
        await createFeeRecord(db, fee);
      }
      console.log(`[v0] Created fees for: ${student.enrollmentNo}`);

      const studentTimetable = buildStudentTimetable(student.enrollmentNo, student.department);
      if (studentTimetable.length > 0) {
        await db.collection<TimetableSeed>("timetable").insertMany(studentTimetable);
      }

      const studentAttendance = buildStudentAttendance(student.enrollmentNo, index);
      if (studentAttendance.length > 0) {
        await db.collection<StudentAttendanceSeed>("student_attendance").insertMany(studentAttendance);
      }
    }

    const adminTimetable = buildAdminTimetable();
    if (adminTimetable.length > 0) {
      await db.collection<TimetableSeed>("timetable").insertMany(adminTimetable);
    }

    const attendanceLogs = buildAttendanceLogs();
    if (attendanceLogs.length > 0) {
      await db.collection<AttendanceLogSeed>("attendance_logs").insertMany(attendanceLogs);
    }

    // === Seed class-based timetables into `timetables` collection ===
    // This is what Admin TT manager and Student/Faculty timetable APIs use
    await db.collection("timetables").deleteMany({});
    console.log("[v0] Cleared timetables collection");

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
      },
      {
        department: "Electronics",
        program: "B.Tech",
        semester: 4,
        section: "A",
        periods: ["09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM", "02:00 PM - 03:00 PM"],
        schedule: [
          { day: "Monday", slots: [
            { time: "09:00 AM - 10:00 AM", subject: "Signal Processing", facultyId: "FAC002", room: "C101" },
            { time: "10:00 AM - 11:00 AM", subject: "VLSI Design", facultyId: "FAC002", room: "C102" },
          ]},
          { day: "Wednesday", slots: [
            { time: "09:00 AM - 10:00 AM", subject: "Signal Processing", facultyId: "FAC002", room: "C101" },
            { time: "02:00 PM - 03:00 PM", subject: "Electronics Lab", facultyId: "FAC002", room: "Lab-4" },
          ]},
          { day: "Friday", slots: [
            { time: "09:00 AM - 10:00 AM", subject: "VLSI Design", facultyId: "FAC002", room: "C102" },
          ]},
        ],
        updatedAt: new Date(),
      },
      {
        department: "Mechanical",
        program: "B.Tech",
        semester: 2,
        section: "A",
        periods: ["09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM"],
        schedule: [
          { day: "Monday", slots: [
            { time: "09:00 AM - 10:00 AM", subject: "Engineering Mechanics", facultyId: "FAC004", room: "D101" },
            { time: "10:00 AM - 11:00 AM", subject: "Thermodynamics", facultyId: "FAC004", room: "D102" },
          ]},
          { day: "Tuesday", slots: [
            { time: "09:00 AM - 10:00 AM", subject: "Engineering Drawing", facultyId: "FAC004", room: "D201" },
          ]},
          { day: "Thursday", slots: [
            { time: "09:00 AM - 10:00 AM", subject: "Thermodynamics", facultyId: "FAC004", room: "D102" },
            { time: "10:00 AM - 11:00 AM", subject: "Workshop", facultyId: "FAC004", room: "Workshop" },
          ]},
        ],
        updatedAt: new Date(),
      },
      {
        department: "Computer Science",
        program: "B.Tech",
        semester: 6,
        section: "A",
        periods: ["09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM", "02:00 PM - 03:00 PM"],
        schedule: [
          { day: "Monday", slots: [
            { time: "09:00 AM - 10:00 AM", subject: "Machine Learning", facultyId: "FAC001", room: "A201" },
            { time: "10:00 AM - 11:00 AM", subject: "Compiler Design", facultyId: "FAC006", room: "A202" },
          ]},
          { day: "Wednesday", slots: [
            { time: "09:00 AM - 10:00 AM", subject: "Machine Learning", facultyId: "FAC001", room: "A201" },
            { time: "02:00 PM - 03:00 PM", subject: "ML Lab", facultyId: "FAC001", room: "Lab-1" },
          ]},
          { day: "Friday", slots: [
            { time: "09:00 AM - 10:00 AM", subject: "Compiler Design", facultyId: "FAC006", room: "A202" },
            { time: "10:00 AM - 11:00 AM", subject: "Software Engineering", facultyId: "FAC003", room: "A203" },
          ]},
        ],
        updatedAt: new Date(),
      },
    ];

    for (const tt of classTimetables) {
      await db.collection("timetables").insertOne(tt);
    }
    console.log(`[v0] Seeded ${classTimetables.length} class timetables`);

    console.log("\n[v0] Seeding completed successfully!");
    console.log("\n=== ADMIN LOGIN ===");
    console.log("Admin ID/Email: ADMIN001 / admin@college.ac.in");
    console.log("Password: Harsh@9410");
    console.log("\n=== FACULTY LOGIN ===");
    console.log("Faculty ID/Email: FAC001..FAC007 or faculty email");
    console.log("Password: password123");
    console.log("\n=== STUDENT LOGIN ===");
    console.log("Enrollment/Email: EN2024001..EN2024020 or student email");
    console.log("Password: password123");
    console.log("========================\n");

    process.exit(0);
  } catch (error) {
    console.error("[v0] Seeding failed:", error);
    process.exit(1);
  }
}

seed();

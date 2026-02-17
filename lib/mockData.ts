// Mock student data and utilities for the ERP system

export interface AttendanceRecord {
  date: string;
  period: string;
  subject: string;
  status: "P" | "A" | "L" | "M" | "O"; // P=Present, A=Absent, L=Leave, M=Medical, O=Other
  remarks: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  faculty: string;
  type: "Core" | "Elective";
  syllabusPDF: string;
}

export interface TimetableSlot {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  period: number;
  time: string;
  subject: string;
  room: string;
  teacher: string;
  joinLink: string;
}

export interface AssignmentRecord {
  id: string;
  subject: string;
  title: string;
  issueDate: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Graded";
  marks?: number;
  feedback?: string;
  submittedFile?: string;
}

export interface ExamResult {
  subject: string;
  internal: number;
  external: number;
  total: number;
  percentage: number;
  grade: string;
  credits: number;
}

export interface FeeRecord {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "Paid" | "Pending" | "Overdue";
  modeOfPayment?: string;
}

export interface Notice {
  id: string;
  title: string;
  date: string;
  priority: "High" | "Medium" | "Low";
  content: string;
  isUnread: boolean;
}

export interface StudentProfile {
  id: string;
  enrollmentNo: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  department: string;
  semester: number;
  year: number;
  dateOfBirth: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  photoURL: string;
  lastLogin: string;
  admissionDate: string;
}

const mockStudent: StudentProfile = {
  id: "STU001",
  enrollmentNo: "EN2024001",
  rollNo: "001",
  name: "Aarav Kumar",
  email: "aarav.kumar@college.ac.in",
  phone: "+91-9876543210",
  program: "B.Sc. Mathematics",
  department: "Science",
  semester: 3,
  year: 2,
  dateOfBirth: "2004-05-15",
  address: "123 Educational Lane, Delhi, India 110001",
  guardianName: "Rajesh Kumar",
  guardianPhone: "+91-9876543211",
  photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
  lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  admissionDate: "2022-07-15",
};

const mockSubjects: Subject[] = [
  {
    id: "S001",
    code: "MTH301",
    name: "Calculus III",
    credits: 4,
    faculty: "Dr. Priya Sharma",
    type: "Core",
    syllabusPDF: "/syllabus/MTH301.pdf",
  },
  {
    id: "S002",
    code: "MTH302",
    name: "Linear Algebra",
    credits: 4,
    faculty: "Prof. Vikram Singh",
    type: "Core",
    syllabusPDF: "/syllabus/MTH302.pdf",
  },
  {
    id: "S003",
    code: "MTH303",
    name: "Discrete Mathematics",
    credits: 3,
    faculty: "Dr. Neha Patel",
    type: "Core",
    syllabusPDF: "/syllabus/MTH303.pdf",
  },
  {
    id: "S004",
    code: "MTH304",
    name: "Graph Theory",
    credits: 3,
    faculty: "Prof. Rajesh Verma",
    type: "Elective",
    syllabusPDF: "/syllabus/MTH304.pdf",
  },
  {
    id: "S005",
    code: "CSC301",
    name: "Data Structures",
    credits: 4,
    faculty: "Dr. Ananya Gupta",
    type: "Core",
    syllabusPDF: "/syllabus/CSC301.pdf",
  },
];

const mockTimetable: TimetableSlot[] = [
  {
    day: "Monday",
    period: 1,
    time: "09:00 - 10:00",
    subject: "Calculus III",
    room: "A101",
    teacher: "Dr. Priya Sharma",
    joinLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    day: "Monday",
    period: 2,
    time: "10:15 - 11:15",
    subject: "Data Structures",
    room: "B205",
    teacher: "Dr. Ananya Gupta",
    joinLink: "https://meet.google.com/xyz-defg-hij",
  },
  {
    day: "Monday",
    period: 3,
    time: "11:30 - 12:30",
    subject: "Discrete Mathematics",
    room: "A201",
    teacher: "Dr. Neha Patel",
    joinLink: "https://meet.google.com/pqr-stuv-wxyz",
  },
  {
    day: "Tuesday",
    period: 1,
    time: "09:00 - 10:00",
    subject: "Linear Algebra",
    room: "A102",
    teacher: "Prof. Vikram Singh",
    joinLink: "https://meet.google.com/lmn-opqr-stu",
  },
  {
    day: "Tuesday",
    period: 2,
    time: "10:15 - 11:15",
    subject: "Graph Theory",
    room: "B206",
    teacher: "Prof. Rajesh Verma",
    joinLink: "https://meet.google.com/vwx-yzab-cde",
  },
  {
    day: "Wednesday",
    period: 1,
    time: "09:00 - 10:00",
    subject: "Calculus III",
    room: "A101",
    teacher: "Dr. Priya Sharma",
    joinLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    day: "Thursday",
    period: 1,
    time: "09:00 - 10:00",
    subject: "Data Structures",
    room: "B205",
    teacher: "Dr. Ananya Gupta",
    joinLink: "https://meet.google.com/xyz-defg-hij",
  },
  {
    day: "Thursday",
    period: 2,
    time: "10:15 - 11:15",
    subject: "Linear Algebra",
    room: "A102",
    teacher: "Prof. Vikram Singh",
    joinLink: "https://meet.google.com/lmn-opqr-stu",
  },
  {
    day: "Friday",
    period: 1,
    time: "09:00 - 10:00",
    subject: "Discrete Mathematics",
    room: "A201",
    teacher: "Dr. Neha Patel",
    joinLink: "https://meet.google.com/pqr-stuv-wxyz",
  },
  {
    day: "Friday",
    period: 2,
    time: "10:15 - 11:15",
    subject: "Graph Theory",
    room: "B206",
    teacher: "Prof. Rajesh Verma",
    joinLink: "https://meet.google.com/vwx-yzab-cde",
  },
];

// Generate 60 days of attendance data
const generateAttendanceData = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const startDate = new Date(2024, 11, 1); // December 1, 2024
  const statuses: Array<"P" | "A" | "L" | "M" | "O"> = [
    "P",
    "P",
    "P",
    "A",
    "L",
  ];
  const subjectsArray = mockSubjects.map((s) => s.name);

  for (let i = 0; i < 60; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // 3-4 periods per day
    const periodsPerDay = Math.random() > 0.3 ? 3 : 4;

    for (let j = 1; j <= periodsPerDay; j++) {
      const statusIndex = Math.floor(Math.random() * statuses.length);
      records.push({
        date: date.toISOString().split("T")[0],
        period: `Period ${j}`,
        subject: subjectsArray[Math.floor(Math.random() * subjectsArray.length)],
        status: statuses[statusIndex],
        remarks:
          statuses[statusIndex] === "L"
            ? "Medical leave"
            : statuses[statusIndex] === "M"
              ? "Medical certificate provided"
              : "",
      });
    }
  }

  return records;
};

const mockAttendance: AttendanceRecord[] = generateAttendanceData();

// Calculate overall attendance percentage
export const calculateAttendancePercentage = (): number => {
  const presentDays = mockAttendance.filter(
    (a) => a.status === "P"
  ).length;
  const totalDays = mockAttendance.length;
  return Math.round((presentDays / totalDays) * 100);
};

const mockAssignments: AssignmentRecord[] = [
  {
    id: "A001",
    subject: "Calculus III",
    title: "Integration by Parts Problem Set",
    issueDate: "2024-12-01",
    dueDate: "2024-12-08",
    status: "Submitted",
    marks: 18,
    feedback: "Good work, minor calculation errors in Q3",
    submittedFile: "/submissions/calculus_ps1.pdf",
  },
  {
    id: "A002",
    subject: "Linear Algebra",
    title: "Matrix Operations Assignment",
    issueDate: "2024-12-03",
    dueDate: "2024-12-10",
    status: "Submitted",
    marks: 19,
    feedback: "Excellent understanding of concepts",
  },
  {
    id: "A003",
    subject: "Data Structures",
    title: "Implement Binary Search Tree",
    issueDate: "2024-12-05",
    dueDate: "2024-12-15",
    status: "Pending",
  },
  {
    id: "A004",
    subject: "Discrete Mathematics",
    title: "Graph Coloring and Algorithms",
    issueDate: "2024-12-01",
    dueDate: "2024-12-20",
    status: "Pending",
  },
  {
    id: "A005",
    subject: "Graph Theory",
    title: "Prove Hamiltonian Cycle Properties",
    issueDate: "2024-12-02",
    dueDate: "2024-12-25",
    status: "Graded",
    marks: 17,
    feedback: "Creative proof approach",
  },
];

const mockExamResults: ExamResult[] = [
  {
    subject: "Calculus III",
    internal: 38,
    external: 62,
    total: 100,
    percentage: 75,
    grade: "B+",
    credits: 4,
  },
  {
    subject: "Linear Algebra",
    internal: 40,
    external: 68,
    total: 108,
    percentage: 84,
    grade: "A",
    credits: 4,
  },
  {
    subject: "Discrete Mathematics",
    internal: 36,
    external: 58,
    total: 94,
    percentage: 70,
    grade: "B",
    credits: 3,
  },
  {
    subject: "Data Structures",
    internal: 42,
    external: 65,
    total: 107,
    percentage: 85,
    grade: "A",
    credits: 4,
  },
];

const mockFees: FeeRecord[] = [
  {
    id: "FEE001",
    description: "Tuition Fee - Semester 3",
    amount: 50000,
    dueDate: "2024-12-31",
    paidDate: "2024-12-15",
    status: "Paid",
    modeOfPayment: "Online Transfer",
  },
  {
    id: "FEE002",
    description: "Examination Fee",
    amount: 5000,
    dueDate: "2024-12-31",
    paidDate: "2024-12-15",
    status: "Paid",
    modeOfPayment: "Online Transfer",
  },
  {
    id: "FEE003",
    description: "Library Fee",
    amount: 2000,
    dueDate: "2025-01-15",
    status: "Pending",
  },
  {
    id: "FEE004",
    description: "Lab Fee",
    amount: 3000,
    dueDate: "2025-01-15",
    status: "Pending",
  },
  {
    id: "FEE005",
    description: "Activity Fee",
    amount: 1500,
    dueDate: "2025-01-31",
    status: "Pending",
  },
];

const mockNotices: Notice[] = [
  {
    id: "N001",
    title: "Semester Exam Schedule Released",
    date: "2024-12-10",
    priority: "High",
    content: "The semester exam schedule has been released. Please check the portal for details.",
    isUnread: true,
  },
  {
    id: "N002",
    title: "Holiday Announcement - New Year Break",
    date: "2024-12-08",
    priority: "Medium",
    content:
      "College will remain closed from December 25, 2024 to January 5, 2025.",
    isUnread: true,
  },
  {
    id: "N003",
    title: "Hostel Room Allocation - Sem 4",
    date: "2024-12-05",
    priority: "Medium",
    content: "Room allocation for semester 4 has been finalized. Check your portal.",
    isUnread: false,
  },
  {
    id: "N004",
    title: "Technical Seminar - AI & Machine Learning",
    date: "2024-12-01",
    priority: "Low",
    content: "Upcoming technical seminar on AI & ML. Register on the portal.",
    isUnread: false,
  },
];

export {
  mockStudent,
  mockSubjects,
  mockTimetable,
  mockAttendance,
  mockAssignments,
  mockExamResults,
  mockFees,
  mockNotices,
};

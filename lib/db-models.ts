import bcrypt from "bcryptjs";
import { Db, ObjectId } from "mongodb";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface ChatSession {
  _id?: ObjectId;
  sessionId: string;
  userId: string;
  role: "student" | "faculty" | "admin";
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Notice {
  _id?: ObjectId;
  noticeId: string;
  title: string;
  content: string;
  priority: "High" | "Medium" | "Low";
  targetRole: "all" | "student" | "faculty";
  isUnread?: boolean; // dynamic for client
  createdAt: Date;
}

export interface AttendanceRecord {
  _id?: ObjectId;
  enrollmentNo: string;
  date: string; // YYYY-MM-DD
  period: string;
  subject: string;
  status: "P" | "A" | "L" | "M";
  facultyId: string;
  createdAt: Date;
}

export interface SystemMeta {
  _id?: ObjectId;
  type: "academic_structure";
  programs: string[];
  semesters: number[];
  sections: string[];
  departments: string[];
  designations: string[];
  specializations: string[];
  updatedAt: Date;
}

export interface ReminderItem {
  _id?: string;
  userId: string;
  message: string;
  remindAt: string;
  status: "pending" | "notified" | "completed";
  createdAt: Date;
}

export interface TimetableSlot {
  time: string; // e.g., "09:00 - 10:00 AM"
  subject: string;
  facultyId: string; // Employee ID
  room: string;
}

export interface TimetableDay {
  day: string; // e.g., "Monday"
  slots: TimetableSlot[];
}

export interface Timetable {
  _id?: ObjectId;
  department: string;
  program: string;
  semester: number;
  section: string;
  schedule: TimetableDay[];
  periods?: string[] | null;
  updatedAt: Date;
}

export interface Student {
  _id?: ObjectId;
  enrollmentNo: string;
  rollNo?: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // hashed
  phone: string;
  department: string;
  program?: string;
  semester: number;
  year?: number;
  section?: string;
  cgpa: number;
  dateOfBirth?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  photoURL?: string;
  admissionDate?: string;
  lastLogin?: string;
  role: "student";
  createdAt: Date;
  updatedAt: Date;
  resetCode?: string;
  resetCodeExpires?: Date;
}

export interface Faculty {
  _id?: ObjectId;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // hashed
  phone: string;
  department: string;
  designation: string;
  specialization: string;
  role: "faculty";
  createdAt: Date;
  updatedAt: Date;
  resetCode?: string;
  resetCodeExpires?: Date;
}

export interface Admin {
  _id?: ObjectId;
  adminId: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // hashed
  phone: string;
  permissions: string[];
  role: "admin";
  createdAt: Date;
  updatedAt: Date;
  resetCode?: string;
  resetCodeExpires?: Date;
}

export type User = Student | Faculty | Admin;
export type UserRole = User["role"];

export type LoginUser =
  | { role: "student"; user: Student; uniqueId: string }
  | { role: "faculty"; user: Faculty; uniqueId: string }
  | { role: "admin"; user: Admin; uniqueId: string };

const normalizeEmail = (email: string): string => email.trim().toLowerCase();
const normalizeEnrollmentNo = (enrollmentNo: string): string => enrollmentNo.trim().toUpperCase();
const normalizeEmployeeId = (employeeId: string): string => employeeId.trim().toUpperCase();
const normalizeAdminId = (adminId: string): string => adminId.trim().toUpperCase();

const normalizeStudentInput = <
  T extends {
    enrollmentNo: string;
    email: string;
  },
>(
  student: T
): T => ({
  ...student,
  enrollmentNo: normalizeEnrollmentNo(student.enrollmentNo),
  email: normalizeEmail(student.email),
});

const normalizeFacultyInput = <
  T extends {
    employeeId: string;
    email: string;
  },
>(
  faculty: T
): T => ({
  ...faculty,
  employeeId: normalizeEmployeeId(faculty.employeeId),
  email: normalizeEmail(faculty.email),
});

const normalizeAdminInput = <
  T extends {
    adminId: string;
    email: string;
  },
>(
  admin: T
): T => ({
  ...admin,
  adminId: normalizeAdminId(admin.adminId),
  email: normalizeEmail(admin.email),
});

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Student operations
export async function createStudent(db: Db, studentData: Omit<Student, "_id" | "createdAt" | "updatedAt" | "password" | "role"> & { password: string }): Promise<Student> {
  const normalizedStudent = normalizeStudentInput(studentData);
  const hashedPassword = await hashPassword(studentData.password);
  const now = new Date();

  const result = await db.collection<Student>("students").insertOne({
    ...normalizedStudent,
    password: hashedPassword,
    role: "student",
    createdAt: now,
    updatedAt: now,
  } as Student);

  return {
    ...normalizedStudent,
    password: hashedPassword,
    role: "student",
    _id: result.insertedId,
    createdAt: now,
    updatedAt: now,
  };
}

export async function findStudentByEnrollment(db: Db, enrollmentNo: string): Promise<Student | null> {
  return db.collection<Student>("students").findOne({ enrollmentNo: normalizeEnrollmentNo(enrollmentNo) });
}

export async function getStudentAttendance(db: Db, enrollmentNo: string): Promise<AttendanceRecord[]> {
  return db.collection<AttendanceRecord>("attendance")
    .find({ enrollmentNo: normalizeEnrollmentNo(enrollmentNo) })
    .sort({ date: -1 })
    .toArray();
}

export async function findStudentByEmail(db: Db, email: string): Promise<Student | null> {
  return db.collection<Student>("students").findOne({ email: normalizeEmail(email) });
}

export async function getAllStudents(db: Db): Promise<Student[]> {
  return db.collection<Student>("students").find({}).toArray();
}

export async function updateStudent(db: Db, enrollmentNo: string, data: Partial<Omit<Student, "password" | "_id" | "role">>): Promise<Student | null> {
  const updateData = { ...data };
  if (updateData.email) {
    updateData.email = normalizeEmail(updateData.email);
  }

  const result = await db.collection<Student>("students").findOneAndUpdate(
    { enrollmentNo: normalizeEnrollmentNo(enrollmentNo) },
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );
  return result;
}

export async function deleteStudent(db: Db, enrollmentNo: string): Promise<boolean> {
  const result = await db.collection<Student>("students").deleteOne({ enrollmentNo: normalizeEnrollmentNo(enrollmentNo) });
  return result.deletedCount > 0;
}

export async function updateStudentPassword(db: Db, enrollmentNo: string, newPassword: string): Promise<void> {
  const hashedPassword = await hashPassword(newPassword);
  await db.collection<Student>("students").updateOne(
    { enrollmentNo: normalizeEnrollmentNo(enrollmentNo) },
    {
      $set: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    }
  );
}

// Faculty operations
export async function createFaculty(db: Db, facultyData: Omit<Faculty, "_id" | "createdAt" | "updatedAt" | "password" | "role"> & { password: string }): Promise<Faculty> {
  const normalizedFaculty = normalizeFacultyInput(facultyData);
  const hashedPassword = await hashPassword(facultyData.password);
  const now = new Date();

  const result = await db.collection<Faculty>("faculty").insertOne({
    ...normalizedFaculty,
    password: hashedPassword,
    role: "faculty",
    createdAt: now,
    updatedAt: now,
  } as Faculty);

  return {
    ...normalizedFaculty,
    password: hashedPassword,
    role: "faculty",
    _id: result.insertedId,
    createdAt: now,
    updatedAt: now,
  };
}

export async function findFacultyByEmployeeId(db: Db, employeeId: string): Promise<Faculty | null> {
  return db.collection<Faculty>("faculty").findOne({ employeeId: normalizeEmployeeId(employeeId) });
}

export async function findFacultyByEmail(db: Db, email: string): Promise<Faculty | null> {
  return db.collection<Faculty>("faculty").findOne({ email: normalizeEmail(email) });
}

export async function getAllFaculty(db: Db): Promise<Faculty[]> {
  return db.collection<Faculty>("faculty").find({}).toArray();
}

export async function updateFaculty(db: Db, employeeId: string, data: Partial<Omit<Faculty, "password" | "_id" | "role">>): Promise<Faculty | null> {
  const updateData = { ...data };
  if (updateData.email) {
    updateData.email = normalizeEmail(updateData.email);
  }

  const result = await db.collection<Faculty>("faculty").findOneAndUpdate(
    { employeeId: normalizeEmployeeId(employeeId) },
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );
  return result;
}

export async function deleteFaculty(db: Db, employeeId: string): Promise<boolean> {
  const result = await db.collection<Faculty>("faculty").deleteOne({ employeeId: normalizeEmployeeId(employeeId) });
  return result.deletedCount > 0;
}

export async function updateFacultyPassword(db: Db, employeeId: string, newPassword: string): Promise<void> {
  const hashedPassword = await hashPassword(newPassword);
  await db.collection<Faculty>("faculty").updateOne(
    { employeeId: normalizeEmployeeId(employeeId) },
    {
      $set: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    }
  );
}

// Admin operations
export async function createAdmin(db: Db, adminData: Omit<Admin, "_id" | "createdAt" | "updatedAt" | "password" | "role"> & { password: string }): Promise<Admin> {
  const normalizedAdmin = normalizeAdminInput(adminData);
  const hashedPassword = await hashPassword(adminData.password);
  const now = new Date();

  const result = await db.collection<Admin>("admins").insertOne({
    ...normalizedAdmin,
    password: hashedPassword,
    role: "admin",
    createdAt: now,
    updatedAt: now,
  } as Admin);

  return {
    ...normalizedAdmin,
    password: hashedPassword,
    role: "admin",
    _id: result.insertedId,
    createdAt: now,
    updatedAt: now,
  };
}

export async function findAdminByAdminId(db: Db, adminId: string): Promise<Admin | null> {
  return db.collection<Admin>("admins").findOne({ adminId: normalizeAdminId(adminId) });
}

export async function findAdminByEmail(db: Db, email: string): Promise<Admin | null> {
  return db.collection<Admin>("admins").findOne({ email: normalizeEmail(email) });
}

export async function getAllAdmins(db: Db): Promise<Admin[]> {
  return db.collection<Admin>("admins").find({}).toArray();
}

export async function updateAdmin(db: Db, adminId: string, data: Partial<Omit<Admin, "password" | "_id" | "role">>): Promise<Admin | null> {
  const updateData = { ...data };
  if (updateData.email) {
    updateData.email = normalizeEmail(updateData.email);
  }

  const result = await db.collection<Admin>("admins").findOneAndUpdate(
    { adminId: normalizeAdminId(adminId) },
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );
  return result;
}

export async function updateAdminPassword(db: Db, adminId: string, newPassword: string): Promise<void> {
  const hashedPassword = await hashPassword(newPassword);
  await db.collection<Admin>("admins").updateOne(
    { adminId: normalizeAdminId(adminId) },
    {
      $set: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    }
  );
}

export async function deleteAdmin(db: Db, adminId: string): Promise<boolean> {
  const result = await db.collection<Admin>("admins").deleteOne({ adminId: normalizeAdminId(adminId) });
  return result.deletedCount > 0;
}

export async function findUserByIdentifier(db: Db, identifier: string): Promise<LoginUser | null> {
  const normalizedIdentifier = identifier.trim();
  if (!normalizedIdentifier) {
    return null;
  }

  const normalizedAsId = normalizedIdentifier.toUpperCase();
  const normalizedAsEmail = normalizedIdentifier.toLowerCase();

  const adminById = await findAdminByAdminId(db, normalizedAsId);
  if (adminById) {
    return { role: "admin", user: adminById, uniqueId: adminById.adminId };
  }

  const facultyById = await findFacultyByEmployeeId(db, normalizedAsId);
  if (facultyById) {
    return { role: "faculty", user: facultyById, uniqueId: facultyById.employeeId };
  }

  const studentById = await findStudentByEnrollment(db, normalizedAsId);
  if (studentById) {
    return { role: "student", user: studentById, uniqueId: studentById.enrollmentNo };
  }

  const adminByEmail = await findAdminByEmail(db, normalizedAsEmail);
  if (adminByEmail) {
    return { role: "admin", user: adminByEmail, uniqueId: adminByEmail.adminId };
  }

  const facultyByEmail = await findFacultyByEmail(db, normalizedAsEmail);
  if (facultyByEmail) {
    return { role: "faculty", user: facultyByEmail, uniqueId: facultyByEmail.employeeId };
  }

  const studentByEmail = await findStudentByEmail(db, normalizedAsEmail);
  if (studentByEmail) {
    return { role: "student", user: studentByEmail, uniqueId: studentByEmail.enrollmentNo };
  }

  return null;
}

export async function findAnyUserByEmail(db: Db, email: string): Promise<User | null> {
  const normalized = normalizeEmail(email);
  const [admin, faculty, student] = await Promise.all([
    findAdminByEmail(db, normalized),
    findFacultyByEmail(db, normalized),
    findStudentByEmail(db, normalized),
  ]);

  return admin ?? faculty ?? student;
}

// ChatSession operations
export async function createChatSession(db: Db, sessionData: Omit<ChatSession, "_id" | "createdAt" | "updatedAt">): Promise<ChatSession> {
  const now = new Date();
  const session = {
    ...sessionData,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection<ChatSession>("chat_sessions").insertOne(session as ChatSession);
  return { ...session, _id: result.insertedId } as ChatSession;
}

export async function findChatSessionsByUser(db: Db, userId: string, role: string): Promise<ChatSession[]> {
  return db.collection<ChatSession>("chat_sessions")
    .find({ userId, role: role as any })
    .sort({ updatedAt: -1 })
    .toArray();
}

export async function findChatSessionById(db: Db, sessionId: string): Promise<ChatSession | null> {
  return db.collection<ChatSession>("chat_sessions").findOne({ sessionId });
}

export async function updateChatSessionMessages(db: Db, sessionId: string, messages: Message[], title?: string): Promise<void> {
  const update: any = {
    $set: {
      messages,
      updatedAt: new Date(),
    },
  };
  if (title) {
    update.$set.title = title;
  }
  await db.collection<ChatSession>("chat_sessions").updateOne({ sessionId }, update);
}

export async function deleteChatSession(db: Db, sessionId: string): Promise<boolean> {
  const result = await db.collection<ChatSession>("chat_sessions").deleteOne({ sessionId });
  return result.deletedCount > 0;
}

// Notice operations
export async function createNotice(db: Db, noticeData: Omit<Notice, "_id" | "createdAt">): Promise<Notice> {
  const notice = { ...noticeData, createdAt: new Date() };
  const result = await db.collection<Notice>("notices").insertOne(notice as Notice);
  return { ...notice, _id: result.insertedId } as Notice;
}

export async function getAllNotices(db: Db, role?: string): Promise<Notice[]> {
  const query: any = role && role !== "admin" ? { targetRole: { $in: ["all", role] } } : {};
  return db.collection<Notice>("notices").find(query).sort({ createdAt: -1 }).toArray();
}

export async function deleteNotice(db: Db, noticeId: string): Promise<boolean> {
  const result = await db.collection<Notice>("notices").deleteOne({ noticeId });
  return result.deletedCount > 0;
}

// Attendance operations
export async function markAttendance(db: Db, record: Omit<AttendanceRecord, "_id" | "createdAt">): Promise<void> {
  await db.collection<AttendanceRecord>("attendance").updateOne(
    { enrollmentNo: record.enrollmentNo, date: record.date, period: record.period },
    { $set: { ...record, createdAt: new Date() } },
    { upsert: true }
  );
}

// Meta operations
export async function getSystemMeta(db: Db): Promise<SystemMeta> {
  const meta = await db.collection<SystemMeta>("system_meta").findOne({ type: "academic_structure" });
  if (meta) return meta;
  
  // Create default if not exists
  const defaultMeta: SystemMeta = {
    type: "academic_structure",
    programs: ["B.Tech", "M.Tech", "BCA", "MCA"],
    semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    sections: ["A", "B", "C"],
    departments: ["Computer Science", "Information Technology", "Mechanical", "Electrical", "Civil"],
    designations: ["Professor", "Associate Professor", "Assistant Professor", "Lecturer"],
    specializations: ["AI/ML", "Cloud Computing", "Data Science", "Cybersecurity"],
    updatedAt: new Date()
  };
  await db.collection("system_meta").insertOne(defaultMeta);
  return defaultMeta;
}

export async function updateSystemMeta(db: Db, updates: Partial<Omit<SystemMeta, "type">>): Promise<void> {
  await db.collection<SystemMeta>("system_meta").updateOne(
    { type: "academic_structure" },
    { $set: { ...updates, updatedAt: new Date() } },
    { upsert: true }
  );
}

// Reminder operations
export async function getUserReminders(db: Db, userId: string): Promise<ReminderItem[]> {
  const reminders = await db.collection<any>("reminders")
    .find({ userId, status: "pending" })
    .toArray();
  
  return reminders.map(r => ({
    ...r,
    _id: r._id.toString(),
    reminderId: r._id.toString() // Map for the widget which expects reminderId
  }));
}

export async function updateReminderStatus(db: Db, userId: string, reminderId: string, status: ReminderItem["status"]): Promise<void> {
  const { ObjectId } = await import("mongodb");
  await db.collection("reminders").updateOne(
    { _id: new ObjectId(reminderId), userId },
    { $set: { status } }
  );
}

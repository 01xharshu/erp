import bcrypt from "bcryptjs";
import { Db, ObjectId } from "mongodb";

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

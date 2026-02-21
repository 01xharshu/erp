import bcrypt from "bcryptjs";
import { Db, ObjectId } from "mongodb";

export interface Student {
  _id?: ObjectId;
  enrollmentNo: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // hashed
  phone: string;
  department: string;
  semester: number;
  cgpa: number;
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
  const hashedPassword = await hashPassword(studentData.password);

  const result = await db.collection<Student>("students").insertOne({
    ...studentData,
    password: hashedPassword,
    role: "student",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Student);

  return {
    ...studentData,
    password: hashedPassword,
    role: "student",
    _id: result.insertedId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function findStudentByEnrollment(db: Db, enrollmentNo: string): Promise<Student | null> {
  return db.collection<Student>("students").findOne({ enrollmentNo });
}

export async function findStudentByEmail(db: Db, email: string): Promise<Student | null> {
  return db.collection<Student>("students").findOne({ email });
}

export async function getAllStudents(db: Db): Promise<Student[]> {
  return db.collection<Student>("students").find({}).toArray();
}

export async function updateStudent(db: Db, enrollmentNo: string, data: Partial<Omit<Student, "password" | "_id" | "role">>): Promise<Student | null> {
  const result = await db.collection<Student>("students").findOneAndUpdate(
    { enrollmentNo },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );
  return result.value || null;
}

export async function deleteStudent(db: Db, enrollmentNo: string): Promise<boolean> {
  const result = await db.collection<Student>("students").deleteOne({ enrollmentNo });
  return result.deletedCount > 0;
}

export async function updateStudentPassword(db: Db, enrollmentNo: string, newPassword: string): Promise<void> {
  const hashedPassword = await hashPassword(newPassword);
  await db.collection<Student>("students").updateOne(
    { enrollmentNo },
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
  const hashedPassword = await hashPassword(facultyData.password);

  const result = await db.collection<Faculty>("faculty").insertOne({
    ...facultyData,
    password: hashedPassword,
    role: "faculty",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Faculty);

  return {
    ...facultyData,
    password: hashedPassword,
    role: "faculty",
    _id: result.insertedId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function findFacultyByEmployeeId(db: Db, employeeId: string): Promise<Faculty | null> {
  return db.collection<Faculty>("faculty").findOne({ employeeId });
}

export async function findFacultyByEmail(db: Db, email: string): Promise<Faculty | null> {
  return db.collection<Faculty>("faculty").findOne({ email });
}

export async function getAllFaculty(db: Db): Promise<Faculty[]> {
  return db.collection<Faculty>("faculty").find({}).toArray();
}

export async function updateFaculty(db: Db, employeeId: string, data: Partial<Omit<Faculty, "password" | "_id" | "role">>): Promise<Faculty | null> {
  const result = await db.collection<Faculty>("faculty").findOneAndUpdate(
    { employeeId },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );
  return result.value || null;
}

export async function deleteFaculty(db: Db, employeeId: string): Promise<boolean> {
  const result = await db.collection<Faculty>("faculty").deleteOne({ employeeId });
  return result.deletedCount > 0;
}

// Admin operations
export async function createAdmin(db: Db, adminData: Omit<Admin, "_id" | "createdAt" | "updatedAt" | "password" | "role"> & { password: string }): Promise<Admin> {
  const hashedPassword = await hashPassword(adminData.password);

  const result = await db.collection<Admin>("admins").insertOne({
    ...adminData,
    password: hashedPassword,
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Admin);

  return {
    ...adminData,
    password: hashedPassword,
    role: "admin",
    _id: result.insertedId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function findAdminByAdminId(db: Db, adminId: string): Promise<Admin | null> {
  return db.collection<Admin>("admins").findOne({ adminId });
}

export async function findAdminByEmail(db: Db, email: string): Promise<Admin | null> {
  return db.collection<Admin>("admins").findOne({ email });
}

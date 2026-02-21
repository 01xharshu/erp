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
  createdAt: Date;
  updatedAt: Date;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createStudent(db: Db, studentData: Omit<Student, "_id" | "createdAt" | "updatedAt" | "password"> & { password: string }): Promise<Student> {
  const hashedPassword = await hashPassword(studentData.password);

  const result = await db.collection<Student>("students").insertOne({
    ...studentData,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Student);

  return {
    ...studentData,
    password: hashedPassword,
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

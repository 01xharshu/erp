import { Db } from "mongodb";

const pad = (value: number, width: number): string => String(value).padStart(width, "0");

export const buildEnrollmentNo = (year: number, serial: number): string => `EN${year}${pad(serial, 3)}`;

export const buildFacultyEmployeeId = (serial: number): string => `FAC${pad(serial, 3)}`;

const nextSerialFromMatches = (values: string[], pattern: RegExp): number => {
  let max = 0;
  for (const value of values) {
    const match = pattern.exec(value);
    if (!match) continue;
    const serial = Number(match[1]);
    if (Number.isFinite(serial) && serial > max) {
      max = serial;
    }
  }
  return max + 1;
};

export async function getNextEnrollmentNo(db: Db, year = new Date().getFullYear()): Promise<string> {
  const prefix = `EN${year}`;
  const rows = await db
    .collection<{ enrollmentNo: string }>("students")
    .find({ enrollmentNo: { $regex: `^${prefix}\\d{3}$` } }, { projection: { enrollmentNo: 1 } })
    .toArray();

  const serial = nextSerialFromMatches(
    rows.map((row) => row.enrollmentNo),
    new RegExp(`^${prefix}(\\d{3})$`)
  );
  return buildEnrollmentNo(year, serial);
}

export async function getNextFacultyEmployeeId(db: Db): Promise<string> {
  const rows = await db
    .collection<{ employeeId: string }>("faculty")
    .find({ employeeId: { $regex: "^FAC\\d{3}$" } }, { projection: { employeeId: 1 } })
    .toArray();

  const serial = nextSerialFromMatches(
    rows.map((row) => row.employeeId),
    /^FAC(\d{3})$/
  );
  return buildFacultyEmployeeId(serial);
}


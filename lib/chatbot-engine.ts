import { Db } from "mongodb";
import { SessionPayload } from "@/lib/session";

type ChatIntent = "schedule" | "students" | "attendance" | "fees" | "reminder" | "help";
type AppRole = SessionPayload["role"];

interface TimetableEntry {
  entryId: string;
  role: AppRole;
  uniqueId: string;
  dayOfWeek: number;
  subject: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface AttendanceLog {
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

interface StudentAttendanceEntry {
  entryId: string;
  date: string;
  enrollmentNo: string;
  subject: string;
  status: "P" | "A" | "L";
  markedByFacultyId: string;
}

interface FeeRow {
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
}

interface ReminderRow {
  reminderId: string;
  role: AppRole;
  uniqueId: string;
  message: string;
  remindAt: string;
  status: "pending" | "notified" | "done";
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotAnswer {
  reply: string;
  suggestions: string[];
}

const formatLocalDate = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const dayName = (dayIndex: number): string =>
  ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex] || "Today";

const parseReminderCommand = (message: string): { text: string; remindAt: Date } | null => {
  const pattern = /(?:remind me to|set reminder(?: to)?)\s+(.+?)\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const match = pattern.exec(message);
  if (!match) return null;

  const text = match[1]?.trim();
  if (!text) return null;

  const rawHour = Number(match[2]);
  const rawMinute = Number(match[3] ?? "0");
  if (!Number.isFinite(rawHour) || !Number.isFinite(rawMinute)) return null;
  if (rawMinute < 0 || rawMinute > 59) return null;

  let hour = rawHour;
  const ampm = (match[4] ?? "").toLowerCase();
  if (ampm === "pm" && hour < 12) hour += 12;
  if (ampm === "am" && hour === 12) hour = 0;
  if (hour < 0 || hour > 23) return null;

  const now = new Date();
  const remindAt = new Date(now);
  remindAt.setHours(hour, rawMinute, 0, 0);
  if (remindAt.getTime() <= now.getTime()) {
    remindAt.setDate(remindAt.getDate() + 1);
  }

  return { text, remindAt };
};

const formatReminderTime = (isoTime: string): string => {
  const parsed = new Date(isoTime);
  if (!Number.isFinite(parsed.getTime())) return isoTime;
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const detectIntent = (message: string): ChatIntent => {
  const normalized = message.toLowerCase();
  if (/schedule|timetable|class|period|today.*class|today.*schedule/.test(normalized)) return "schedule";
  if (/remind|reminder|notify me|set reminder|my reminder/.test(normalized)) return "reminder";
  if (/attendance|attendence|marked|taken|mark attendance/.test(normalized)) return "attendance";
  if (/students|student list|enrollment|class strength|how many students/.test(normalized)) return "students";
  if (/fee|fees|dues|payment|pending amount/.test(normalized)) return "fees";
  return "help";
};

const roleSuggestions = (role: AppRole): string[] => {
  if (role === "student") {
    return ["Today's schedule", "My attendance today", "Set reminder to submit assignment at 6:30 PM", "Pending fees"];
  }
  if (role === "faculty") {
    return ["Today's classes", "Have I taken attendance today?", "Set reminder to mark attendance at 9:00 AM", "Students in system"];
  }
  return ["Today's admin schedule", "Total students", "Set reminder to review fees at 5:00 PM", "Fee summary"];
};

const handleScheduleIntent = async (db: Db, session: SessionPayload): Promise<string> => {
  const now = new Date();
  const todayIndex = now.getDay();
  const entries = await db
    .collection<TimetableEntry>("timetable")
    .find({
      role: session.role,
      uniqueId: session.uniqueId,
      dayOfWeek: todayIndex,
    })
    .sort({ startTime: 1 })
    .toArray();

  if (entries.length === 0) {
    return `No schedule found for ${dayName(todayIndex)}.`;
  }

  const lines = entries.map((entry) => `• ${entry.startTime}-${entry.endTime}: ${entry.subject} (${entry.room})`);
  return `Your schedule for ${dayName(todayIndex)}:\n${lines.join("\n")}`;
};

const handleStudentsIntent = async (db: Db, session: SessionPayload): Promise<string> => {
  if (session.role === "student") {
    const me = await db.collection("students").findOne(
      { enrollmentNo: session.uniqueId },
      { projection: { firstName: 1, lastName: 1, department: 1, semester: 1, enrollmentNo: 1 } }
    );
    if (!me) return "I could not find your student record.";
    return `You are ${String(me.firstName)} ${String(me.lastName)} (${String(
      me.enrollmentNo
    )}), ${String(me.department)} semester ${String(me.semester)}.`;
  }

  const totalStudents = await db.collection("students").countDocuments();
  const sampleStudents = await db
    .collection("students")
    .find({}, { projection: { firstName: 1, lastName: 1, enrollmentNo: 1, department: 1, semester: 1 } })
    .sort({ enrollmentNo: 1 })
    .limit(5)
    .toArray();

  const preview = sampleStudents
    .map(
      (student) =>
        `• ${String(student.firstName)} ${String(student.lastName)} (${String(student.enrollmentNo)}) - ${String(
          student.department
        )} Sem ${String(student.semester)}`
    )
    .join("\n");

  return `Total students in system: ${totalStudents}\n${preview || "No student records found."}`;
};

const handleAttendanceIntent = async (db: Db, session: SessionPayload): Promise<string> => {
  const today = formatLocalDate(new Date());

  if (session.role === "faculty") {
    const logs = await db
      .collection<AttendanceLog>("attendance_logs")
      .find({ date: today, facultyId: session.uniqueId })
      .sort({ subject: 1 })
      .toArray();

    if (logs.length === 0) {
      return "No attendance has been marked by you today.";
    }

    const lines = logs.map(
      (log) =>
        `• ${log.subject}: ${log.presentStudents}/${log.totalStudents} present (${log.status === "taken" ? "Taken" : "Pending"})`
    );
    return `Attendance status for today (${today}):\n${lines.join("\n")}`;
  }

  if (session.role === "student") {
    const rows = await db
      .collection<StudentAttendanceEntry>("student_attendance")
      .find({ date: today, enrollmentNo: session.uniqueId })
      .sort({ subject: 1 })
      .toArray();

    if (rows.length === 0) {
      return "Your attendance has not been marked yet today.";
    }

    const presentCount = rows.filter((row) => row.status === "P").length;
    const lines = rows.map((row) => `• ${row.subject}: ${row.status}`);
    return `Your attendance today (${today}): ${presentCount}/${rows.length} present\n${lines.join("\n")}`;
  }

  const logs = await db.collection<AttendanceLog>("attendance_logs").find({ date: today }).toArray();
  if (logs.length === 0) {
    return "No attendance logs found for today.";
  }

  const taken = logs.filter((log) => log.status === "taken").length;
  const pending = logs.length - taken;
  const avgPresence =
    logs.reduce((sum, log) => sum + (log.totalStudents > 0 ? (log.presentStudents / log.totalStudents) * 100 : 0), 0) /
    logs.length;
  return `Today's attendance summary (${today}): ${taken} classes taken, ${pending} pending, average presence ${Math.round(
    avgPresence
  )}%.`;
};

const handleFeesIntent = async (db: Db, session: SessionPayload): Promise<string> => {
  if (session.role === "student") {
    const fees = await db.collection<FeeRow>("fees").find({ enrollmentNo: session.uniqueId }).toArray();
    if (fees.length === 0) return "No fee records found for your account.";

    const pending = fees.filter((fee) => fee.status === "Pending" || fee.status === "Overdue").reduce((sum, fee) => sum + fee.amount, 0);
    const paid = fees.filter((fee) => fee.status === "Paid").reduce((sum, fee) => sum + fee.amount, 0);
    return `Your fee summary: Paid ₹${paid}, Pending/Overdue ₹${pending}.`;
  }

  const fees = await db.collection<FeeRow>("fees").find({}).toArray();
  if (fees.length === 0) return "No fee records found in the system.";
  const totalCollected = fees.filter((fee) => fee.status === "Paid").reduce((sum, fee) => sum + fee.amount, 0);
  const totalPending = fees
    .filter((fee) => fee.status === "Pending" || fee.status === "Overdue")
    .reduce((sum, fee) => sum + fee.amount, 0);
  return `System fee summary: Collected ₹${totalCollected}, Pending/Overdue ₹${totalPending}.`;
};

const handleReminderIntent = async (db: Db, session: SessionPayload, message: string): Promise<string> => {
  const parsed = parseReminderCommand(message);
  if (parsed) {
    const now = new Date().toISOString();
    const reminder: ReminderRow = {
      reminderId: `REM-${session.uniqueId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      role: session.role,
      uniqueId: session.uniqueId,
      message: parsed.text,
      remindAt: parsed.remindAt.toISOString(),
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    await db.collection<ReminderRow>("reminders").insertOne(reminder);
    return `Reminder set: "${reminder.message}" at ${formatReminderTime(reminder.remindAt)}.`;
  }

  const reminders = await db
    .collection<ReminderRow>("reminders")
    .find({
      role: session.role,
      uniqueId: session.uniqueId,
      status: { $in: ["pending", "notified"] },
    })
    .sort({ remindAt: 1 })
    .limit(5)
    .toArray();

  if (reminders.length === 0) {
    return "No active reminders found. Example: remind me to submit assignment at 6:30 PM";
  }

  const lines = reminders.map((reminder) => `• ${reminder.message} at ${formatReminderTime(reminder.remindAt)}`);
  return `Your active reminders:\n${lines.join("\n")}`;
};

const helpReply = (role: AppRole): string => {
  if (role === "student") {
    return "I can help with your timetable, attendance status, fee summary, and reminders.";
  }
  if (role === "faculty") {
    return "I can tell your class schedule, attendance logs, student count, and reminders.";
  }
  return "I can provide admin-level schedule, student count, attendance summary, fee analytics, and reminders.";
};

export async function answerChatQuery(db: Db, session: SessionPayload, message: string): Promise<ChatbotAnswer> {
  const text = message.trim();
  if (!text) {
    return {
      reply: "Please type a question so I can help.",
      suggestions: roleSuggestions(session.role),
    };
  }

  const intent = detectIntent(text);

  let reply: string;
  if (intent === "schedule") {
    reply = await handleScheduleIntent(db, session);
  } else if (intent === "reminder") {
    reply = await handleReminderIntent(db, session, text);
  } else if (intent === "students") {
    reply = await handleStudentsIntent(db, session);
  } else if (intent === "attendance") {
    reply = await handleAttendanceIntent(db, session);
  } else if (intent === "fees") {
    reply = await handleFeesIntent(db, session);
  } else {
    reply = helpReply(session.role);
  }

  return {
    reply,
    suggestions: roleSuggestions(session.role),
  };
}

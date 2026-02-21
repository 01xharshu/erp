import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getDatabase } from "@/lib/mongodb";

type ReminderStatus = "pending" | "notified" | "done";

interface ReminderRecord {
  reminderId: string;
  role: "student" | "faculty" | "admin";
  uniqueId: string;
  message: string;
  remindAt: string;
  status: ReminderStatus;
  createdAt: string;
  updatedAt: string;
  notifiedAt?: string;
}

const isValidReminderDate = (value: string): boolean => {
  const date = new Date(value);
  return Number.isFinite(date.getTime());
};

const serializeReminder = (reminder: ReminderRecord): ReminderRecord => ({
  reminderId: reminder.reminderId,
  role: reminder.role,
  uniqueId: reminder.uniqueId,
  message: reminder.message,
  remindAt: reminder.remindAt,
  status: reminder.status,
  createdAt: reminder.createdAt,
  updatedAt: reminder.updatedAt,
  notifiedAt: reminder.notifiedAt,
});

export async function GET(request: NextRequest) {
  const session = requireSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const db = await getDatabase();
    const includeDone = request.nextUrl.searchParams.get("includeDone") === "true";

    const reminders = await db
      .collection<ReminderRecord>("reminders")
      .find({
        role: session.role,
        uniqueId: session.uniqueId,
        ...(includeDone ? {} : { status: { $in: ["pending", "notified"] as ReminderStatus[] } }),
      })
      .sort({ remindAt: 1 })
      .limit(100)
      .toArray();

    return NextResponse.json(
      {
        success: true,
        data: reminders.map(serializeReminder),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Failed to fetch reminders:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reminders",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const body = await request.json();
    const message = String(body.message ?? "").trim();
    const remindAt = String(body.remindAt ?? "").trim();

    if (!message || !remindAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Message and remindAt are required",
        },
        { status: 400 }
      );
    }

    if (message.length > 200) {
      return NextResponse.json(
        {
          success: false,
          message: "Reminder message is too long",
        },
        { status: 400 }
      );
    }

    if (!isValidReminderDate(remindAt)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reminder date/time",
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const reminder: ReminderRecord = {
      reminderId: `REM-${session.uniqueId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      role: session.role,
      uniqueId: session.uniqueId,
      message,
      remindAt: new Date(remindAt).toISOString(),
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDatabase();
    await db.collection<ReminderRecord>("reminders").insertOne(reminder);

    return NextResponse.json(
      {
        success: true,
        data: serializeReminder(reminder),
        message: "Reminder created",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] Failed to create reminder:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create reminder",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = requireSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const body = await request.json();
    const reminderId = String(body.reminderId ?? "").trim();
    const status = String(body.status ?? "").trim() as ReminderStatus;

    if (!reminderId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "reminderId and status are required",
        },
        { status: 400 }
      );
    }

    if (status !== "pending" && status !== "notified" && status !== "done") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reminder status",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const now = new Date().toISOString();

    const updated = await db.collection<ReminderRecord>("reminders").findOneAndUpdate(
      {
        reminderId,
        role: session.role,
        uniqueId: session.uniqueId,
      },
      {
        $set: {
          status,
          updatedAt: now,
          ...(status === "notified" ? { notifiedAt: now } : {}),
        },
      },
      { returnDocument: "after" }
    );

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          message: "Reminder not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: serializeReminder(updated),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Failed to update reminder:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update reminder",
      },
      { status: 500 }
    );
  }
}


import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getDatabase } from "@/lib/mongodb";
import { answerChatQuery } from "@/lib/chatbot-engine";

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const body = await request.json();
    const message = String(body.message ?? "").trim();

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Message is required",
        },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message: "Message is too long",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const answer = await answerChatQuery(db, session, message);

    return NextResponse.json(
      {
        success: true,
        data: answer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Chatbot error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process chatbot request",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = requireSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        greeting:
          session.role === "student"
            ? "Ask me about your schedule, attendance, fees, or reminders."
            : session.role === "faculty"
              ? "Ask about today's classes, students, attendance logs, or reminders."
              : "Ask about student counts, attendance summary, fee summary, admin schedule, or reminders.",
      },
    },
    { status: 200 }
  );
}

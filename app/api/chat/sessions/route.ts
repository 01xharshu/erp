import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { createChatSession, findChatSessionsByUser, deleteChatSession } from "@/lib/db-models";
// This is client-side, but I can't use it in route.ts easily. I'll pass userId in body.

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    if (!userId || !role) {
      return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
    }

    const db = await getDatabase();
    const sessions = await findChatSessionsByUser(db, userId, role);
    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, role, title, firstMessage } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
    }

    const db = await getDatabase();
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    // Create new session
    const session = await createChatSession(db, {
      sessionId,
      userId,
      role,
      title: title || "New Chat",
      messages: firstMessage ? [
        { role: "user", content: firstMessage, createdAt: new Date() }
      ] : []
    });

    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const db = await getDatabase();
    await deleteChatSession(db, sessionId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

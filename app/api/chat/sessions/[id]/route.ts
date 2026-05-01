import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { findChatSessionById, updateChatSessionMessages } from "@/lib/db-models";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const session = await findChatSessionById(db, id);
    
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { messages, title } = body;

    if (!messages) {
      return NextResponse.json({ error: "messages are required" }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Ensure createdAt dates are proper Date objects if they were strings
    const formattedMessages = messages.map((m: any) => ({
      ...m,
      createdAt: m.createdAt ? new Date(m.createdAt) : new Date()
    }));

    await updateChatSessionMessages(db, id, formattedMessages, title);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

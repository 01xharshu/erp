import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getDatabase } from "@/lib/mongodb";


export async function GET(request: NextRequest) {
  const session = requireSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const db = await getDatabase();
    
    if (session.role === "faculty") {
      const assignments = await db.collection("assignments").find({ facultyId: session.employeeId }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ success: true, data: assignments }, { status: 200 });
    } else {
      const assignments = await db.collection("assignments").find({}).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ success: true, data: assignments }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = requireSession(request);
  if (session instanceof NextResponse) return session;

  if (session.role !== "faculty") {
    return NextResponse.json({ success: false, error: "Only faculty can create assignments" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, subject, dueDate, description } = body;

    if (!title || !subject || !dueDate) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDatabase();
    
    const newAssignment = {
      title,
      subject,
      description,
      dueDate,
      facultyId: session.employeeId,
      status: "Active",
      createdAt: new Date(),
      submissions: []
    };

    const result = await db.collection("assignments").insertOne(newAssignment);
    
    return NextResponse.json({ 
      success: true, 
      data: { ...newAssignment, _id: result.insertedId } 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

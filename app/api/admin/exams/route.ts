import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  const adminSession = requireAdminSession(request);
  if (adminSession instanceof NextResponse) return adminSession;

  try {
    const db = await getDatabase();
    const exams = await db.collection("exams").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: exams }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminSession = requireAdminSession(request);
  if (adminSession instanceof NextResponse) return adminSession;

  try {
    const body = await request.json();
    const { name, program, semester, startDate, endDate, status } = body;

    if (!name || !program || !semester || !startDate || !endDate) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Generate an exam ID like EX-2026-01
    const year = new Date(startDate).getFullYear();
    const count = await db.collection("exams").countDocuments({ name: { $regex: new RegExp(`^${name}`, "i") } });
    const examId = `EX-${year}-${String(count + 1).padStart(2, "0")}`;

    const newExam = {
      examId,
      name,
      program,
      semester: parseInt(semester),
      startDate,
      endDate,
      status: status || "Draft",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("exams").insertOne(newExam);

    return NextResponse.json({ success: true, message: "Exam created successfully", data: { ...newExam, _id: result.insertedId } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const adminSession = requireAdminSession(request);
  if (adminSession instanceof NextResponse) return adminSession;

  try {
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ success: false, message: "Exam ID is required" }, { status: 400 });
    }

    const db = await getDatabase();
    
    if (updateData.semester) {
      updateData.semester = parseInt(updateData.semester);
    }
    updateData.updatedAt = new Date();

    const result = await db.collection("exams").findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ success: false, message: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Exam updated successfully", data: result }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const adminSession = requireAdminSession(request);
  if (adminSession instanceof NextResponse) return adminSession;

  try {
    const id = request.nextUrl.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ success: false, message: "Exam ID is required" }, { status: 400 });
    }

    const db = await getDatabase();
    const result = await db.collection("exams").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Exam deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

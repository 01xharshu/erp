import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { syncKnowledgeBase } from "@/lib/ai/local-rag";
import { requireAdminSession } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const auth = requireAdminSession(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const db = await getDatabase();
    
    // 1. Fetch Students
    const students = await db.collection("students").find({}).toArray();
    const studentDocs = students.map(s => ({
      content: `Student Profile: ${s.firstName} ${s.lastName}. Enrollment No: ${s.enrollmentNo}. Program: ${s.program}. Semester: ${s.semester}. Section: ${s.section}. Department: ${s.department}. Roll No: ${s.rollNo || "N/A"}. CGPA: ${s.cgpa || 0}.`,
      source: `student_${s.enrollmentNo}`,
      allowedRoles: ["admin", "faculty", "student"]
    }));

    // 2. Fetch Faculty
    const faculty = await db.collection("faculty").find({}).toArray();
    const facultyDocs = faculty.map(f => ({
      content: `Faculty Profile: ${f.firstName} ${f.lastName}. Employee ID: ${f.employeeId}. Department: ${f.department}. Designation: ${f.designation}. Specialization: ${f.specialization}. Email: ${f.email}.`,
      source: `faculty_${f.employeeId}`,
      allowedRoles: ["admin", "faculty", "student"]
    }));

    // 3. Fetch Notices
    const notices = await db.collection("notices").find({}).toArray();
    const noticeDocs = notices.map(n => ({
      content: `Official Notice: "${n.title}". Content: ${n.content}. Date: ${n.date || "Recently"}. Important for all members.`,
      source: `notice_${n._id}`,
      allowedRoles: ["admin", "faculty", "student"]
    }));

    // 4. Academic Structure (from Metadata)
    const meta = await db.collection("system_meta").findOne({ type: "academic_structure" });
    const metaDoc = meta ? [{
      content: `Institution Academic Structure: Programs available are ${meta.programs?.join(", ")}. Departments include ${meta.departments?.join(", ")}. Sections used are ${meta.sections?.join(", ")}. Semesters range from 1 to ${Math.max(...(meta.semesters || [8]))}.`,
      source: "academic_meta",
      allowedRoles: ["admin", "faculty", "student"]
    }] : [];

    // Combine all
    const allDocs = [...studentDocs, ...facultyDocs, ...noticeDocs, ...metaDoc];

    // Sync to RAG
    if (allDocs.length > 0) {
      await syncKnowledgeBase(allDocs);
    }

    return NextResponse.json({ 
      success: true, 
      message: `AI Knowledge Base updated with ${allDocs.length} records.`,
      count: allDocs.length
    });
  } catch (error: any) {
    console.error("AI Sync Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
